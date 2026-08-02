<?php

namespace App\Services;

use App\Models\GoodsReceivedNote;
use App\Models\GrnItem;
use App\Models\InventoryItem;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnItem;
use App\Models\Supplier;
use App\Models\SupplierTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseService
{
    public function __construct(protected StockService $stockService) {}

    /**
     * Create a purchase order with items, totals, and supplier ledger.
     */
    public function create(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $restaurantId = $data['restaurant_id'] ?? getRestaurantId();
            $data['restaurant_id'] = $restaurantId;
            $data['reference_number'] = $data['reference_number'] ?? 'PO-' . date('Ymd') . '-' . Str::upper(Str::random(4));
            $data['invoice_number'] = $data['invoice_number'] ?? $data['reference_number'];
            $data['purchase_date'] = $data['purchase_date'] ?? now()->toDateString();
            $data['created_by'] = auth()->id() ?? 1;
            $data['name'] = $data['name'] ?? 'Purchase ' . $data['reference_number'];

            $items = $data['items'] ?? [];
            unset($data['items']);

            $data = $this->calculateTotals($data, $items);

            $purchase = Purchase::create($data);
            $this->syncItems($purchase, $items);

            $this->updateSupplierLedger($purchase);

            return $purchase->fresh(['items.inventoryItem', 'supplier', 'branch']);
        });
    }

    /**
     * Update an existing purchase.
     */
    public function update(int $id, array $data): Purchase
    {
        return DB::transaction(function () use ($id, $data) {
            $purchase = Purchase::findOrFail($id);

            $items = $data['items'] ?? null;
            unset($data['items']);

            // Revert old items' stock effect before changing (purchases are not auto-stocked until GRN,
            // so we simply replace line items and recompute totals).
            if ($items !== null) {
                $this->syncItems($purchase, $items);
            }

            $data = $this->calculateTotals($data, $items ?? $purchase->items->toArray());
            $purchase->update($data);

            $this->updateSupplierLedger($purchase);

            return $purchase->fresh(['items.inventoryItem', 'supplier', 'branch']);
        });
    }

    /**
     * Replace purchase line items.
     */
    protected function syncItems(Purchase $purchase, array $items): void
    {
        $purchase->items()->delete();

        foreach ($items as $item) {
            if (empty($item['inventory_item_id'])) {
                continue;
            }

            $inv = InventoryItem::find($item['inventory_item_id']);
            $qty = (float) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['unit_price'] ?? $inv->unit_cost ?? $inv->cost_price ?? 0);
            $taxRate = (float) ($item['tax_rate'] ?? 0);
            $discountPercent = (float) ($item['discount_percent'] ?? 0);

            $subtotal = $qty * $unitPrice;
            $discountAmount = round($subtotal * $discountPercent / 100, 2);
            $taxAmount = round(($subtotal - $discountAmount) * $taxRate / 100, 2);

            PurchaseItem::create([
                'purchase_id' => $purchase->id,
                'inventory_item_id' => $item['inventory_item_id'],
                'item_name' => $item['item_name'] ?? $inv->name ?? 'Item',
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'total' => round($subtotal - $discountAmount + $taxAmount, 2),
                'notes' => $item['notes'] ?? null,
            ]);
        }
    }

    /**
     * Compute subtotal, tax, discount, total, and due amount.
     */
    protected function calculateTotals(array $data, array $items): array
    {
        $subtotal = 0;
        $taxAmount = (float) ($data['tax_amount'] ?? 0);
        $discountAmount = (float) ($data['discount_amount'] ?? 0);
        $shippingCost = (float) ($data['shipping_cost'] ?? 0);

        foreach ($items as $item) {
            $inv = isset($item['inventory_item_id']) ? InventoryItem::find($item['inventory_item_id']) : null;
            $qty = (float) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['unit_price'] ?? $inv?->unit_cost ?? $inv?->cost_price ?? 0);
            $taxRate = (float) ($item['tax_rate'] ?? 0);
            $discountPercent = (float) ($item['discount_percent'] ?? 0);

            $lineSubtotal = $qty * $unitPrice;
            $lineDiscount = $lineSubtotal * $discountPercent / 100;
            $lineTax = ($lineSubtotal - $lineDiscount) * $taxRate / 100;
            $subtotal += $lineSubtotal;
            $taxAmount += $lineTax;
            $discountAmount += $lineDiscount;
        }

        $total = round($subtotal - $discountAmount + $taxAmount + $shippingCost, 2);
        $data['subtotal'] = round($subtotal, 2);
        $data['tax_amount'] = round($taxAmount, 2);
        $data['discount_amount'] = round($discountAmount, 2);
        $data['shipping_cost'] = round($shippingCost, 2);
        $data['total'] = $total;
        $data['paid_amount'] = (float) ($data['paid_amount'] ?? 0);
        $data['due_amount'] = round($total - $data['paid_amount'], 2);

        return $data;
    }

    /**
     * Keep supplier outstanding ledger in sync.
     */
    protected function updateSupplierLedger(Purchase $purchase): void
    {
        if (!$purchase->supplier_id) {
            return;
        }

        $debit = (float) $purchase->total - (float) $purchase->paid_amount;

        SupplierTransaction::create([
            'restaurant_id' => $purchase->restaurant_id,
            'supplier_id' => $purchase->supplier_id,
            'type' => 'purchase',
            'reference_id' => $purchase->id,
            'reference_number' => $purchase->reference_number,
            'debit' => max(0, $debit),
            'credit' => 0,
            'balance' => $debit,
            'description' => 'Purchase ' . $purchase->reference_number,
            'transaction_date' => $purchase->purchase_date ?? now()->toDateString(),
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Record a GRN and add received quantities to stock.
     */
    public function receiveGoods(int $purchaseId, array $data): GoodsReceivedNote
    {
        return DB::transaction(function () use ($purchaseId, $data) {
            $purchase = Purchase::findOrFail($purchaseId);
            $restaurantId = $data['restaurant_id'] ?? $purchase->restaurant_id;

            $grn = GoodsReceivedNote::create([
                'restaurant_id' => $restaurantId,
                'purchase_id' => $purchase->id,
                'grn_number' => $data['grn_number'] ?? 'GRN-' . date('Ymd') . '-' . Str::upper(Str::random(4)),
                'received_date' => $data['received_date'] ?? now()->toDateString(),
                'status' => $data['status'] ?? 'completed',
                'total_quantity' => 0,
                'total_received' => 0,
                'total_rejected' => 0,
                'total_amount' => 0,
                'notes' => $data['notes'] ?? null,
                'storage_location' => $data['storage_location'] ?? null,
                'received_by' => auth()->id() ?? 1,
                'checked_by' => $data['checked_by'] ?? null,
            ]);

            $totalReceived = 0;
            $totalRejected = 0;
            $totalQty = 0;
            $totalAmount = 0;

            foreach ($data['items'] ?? [] as $line) {
                $purchaseItem = PurchaseItem::find($line['purchase_item_id'] ?? null);
                if (!$purchaseItem) {
                    continue;
                }

                $receivedQty = (float) ($line['received_quantity'] ?? 0);
                $rejectedQty = (float) ($line['rejected_quantity'] ?? 0);
                $unitCost = (float) ($line['unit_cost'] ?? $purchaseItem->unit_price);
                $batchNumber = $line['batch_number'] ?? null;

                GrnItem::create([
                    'grn_id' => $grn->id,
                    'purchase_item_id' => $purchaseItem->id,
                    'inventory_item_id' => $purchaseItem->inventory_item_id,
                    'ordered_quantity' => (float) $purchaseItem->quantity,
                    'received_quantity' => $receivedQty,
                    'rejected_quantity' => $rejectedQty,
                    'unit_cost' => $unitCost,
                    'total_cost' => round($receivedQty * $unitCost, 2),
                    'batch_number' => $batchNumber,
                    'manufacture_date' => $line['manufacture_date'] ?? null,
                    'expiry_date' => $line['expiry_date'] ?? null,
                    'notes' => $line['notes'] ?? null,
                ]);

                if ($receivedQty > 0) {
                    $this->stockService->adjustStock(
                        $purchaseItem->inventory_item_id,
                        $receivedQty,
                        'purchase',
                        $restaurantId,
                        $purchase->branch_id,
                        $grn->id,
                        GoodsReceivedNote::class,
                        'GRN ' . $grn->grn_number,
                        $unitCost,
                        ['batch_number' => $batchNumber, 'manufacture_date' => $line['manufacture_date'] ?? null, 'expiry_date' => $line['expiry_date'] ?? null]
                    );
                }

                $totalReceived += $receivedQty;
                $totalRejected += $rejectedQty;
                $totalQty += $receivedQty + $rejectedQty;
                $totalAmount += round($receivedQty * $unitCost, 2);

                $purchaseItem->update([
                    'received_quantity' => $purchaseItem->received_quantity + $receivedQty,
                    'rejected_quantity' => $purchaseItem->rejected_quantity + $rejectedQty,
                ]);
            }

            $grn->update([
                'total_quantity' => $totalQty,
                'total_received' => $totalReceived,
                'total_rejected' => $totalRejected,
                'total_amount' => $totalAmount,
            ]);

            return $grn->fresh(['items.inventoryItem', 'purchase']);
        });
    }

    /**
     * Register a supplier payment and update purchase paid/due.
     */
    public function recordPayment(int $purchaseId, array $data): PurchasePayment
    {
        return DB::transaction(function () use ($purchaseId, $data) {
            $purchase = Purchase::findOrFail($purchaseId);
            $restaurantId = $data['restaurant_id'] ?? $purchase->restaurant_id;
            $amount = (float) ($data['amount'] ?? 0);

            $payment = PurchasePayment::create([
                'restaurant_id' => $restaurantId,
                'purchase_id' => $purchase->id,
                'supplier_id' => $purchase->supplier_id,
                'payment_number' => $data['payment_number'] ?? 'PAY-' . date('Ymd') . '-' . Str::upper(Str::random(4)),
                'payment_date' => $data['payment_date'] ?? now()->toDateString(),
                'amount' => $amount,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => $data['status'] ?? 'completed',
                'created_by' => auth()->id() ?? 1,
            ]);

            $purchase->paid_amount = (float) $purchase->paid_amount + $amount;
            $purchase->due_amount = round((float) $purchase->total - $purchase->paid_amount, 2);
            $purchase->save();

            SupplierTransaction::create([
                'restaurant_id' => $restaurantId,
                'supplier_id' => $purchase->supplier_id,
                'type' => 'payment',
                'reference_id' => $payment->id,
                'reference_number' => $payment->payment_number,
                'debit' => 0,
                'credit' => $amount,
                'balance' => $purchase->due_amount,
                'description' => 'Payment for ' . $purchase->reference_number,
                'transaction_date' => $payment->payment_date,
                'created_by' => auth()->id(),
            ]);

            return $payment->fresh();
        });
    }

    /**
     * Create a purchase return / debit note and reverse stock.
     */
    public function createReturn(int $purchaseId, array $data): PurchaseReturn
    {
        return DB::transaction(function () use ($purchaseId, $data) {
            $purchase = Purchase::findOrFail($purchaseId);
            $restaurantId = $data['restaurant_id'] ?? $purchase->restaurant_id;

            $return = PurchaseReturn::create([
                'restaurant_id' => $restaurantId,
                'purchase_id' => $purchase->id,
                'supplier_id' => $purchase->supplier_id,
                'return_number' => $data['return_number'] ?? 'RET-' . date('Ymd') . '-' . Str::upper(Str::random(4)),
                'return_date' => $data['return_date'] ?? now()->toDateString(),
                'type' => $data['type'] ?? 'return',
                'status' => $data['status'] ?? 'approved',
                'subtotal' => 0,
                'tax_amount' => 0,
                'total' => 0,
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id() ?? 1,
            ]);

            $subtotal = 0;
            foreach ($data['items'] ?? [] as $line) {
                $invItem = InventoryItem::find($line['inventory_item_id'] ?? null);
                if (!$invItem) {
                    continue;
                }

                $qty = (float) ($line['quantity'] ?? 0);
                $unitCost = (float) ($line['unit_cost'] ?? $invItem->unit_cost ?? $invItem->cost_price ?? 0);
                $lineTotal = round($qty * $unitCost, 2);
                $subtotal += $lineTotal;

                PurchaseReturnItem::create([
                    'return_id' => $return->id,
                    'purchase_item_id' => $line['purchase_item_id'] ?? null,
                    'inventory_item_id' => $invItem->id,
                    'item_name' => $invItem->name,
                    'quantity' => $qty,
                    'unit_cost' => $unitCost,
                    'total' => $lineTotal,
                    'reason' => $line['reason'] ?? null,
                ]);

                // Restore stock (return goods to inventory if already received)
                $this->stockService->adjustStock(
                    $invItem->id,
                    $qty,
                    'return',
                    $restaurantId,
                    $purchase->branch_id,
                    $return->id,
                    PurchaseReturn::class,
                    'Return ' . $return->return_number,
                    $unitCost
                );
            }

            $return->update(['subtotal' => $subtotal, 'total' => $subtotal]);

            SupplierTransaction::create([
                'restaurant_id' => $restaurantId,
                'supplier_id' => $purchase->supplier_id,
                'type' => $return->type === 'debit_note' ? 'debit_note' : 'return',
                'reference_id' => $return->id,
                'reference_number' => $return->return_number,
                'debit' => 0,
                'credit' => $subtotal,
                'balance' => -1 * $subtotal,
                'description' => ucfirst($return->type) . ' ' . $return->return_number,
                'transaction_date' => $return->return_date,
                'created_by' => auth()->id(),
            ]);

            return $return->fresh(['items.inventoryItem', 'purchase', 'supplier']);
        });
    }

    public function delete(int $id): void
    {
        Purchase::findOrFail($id)->delete();
    }
}
