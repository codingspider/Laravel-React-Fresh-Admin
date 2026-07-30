<?php

namespace Modules\POS\Services;

use Illuminate\Support\Facades\DB;
use Modules\POS\Models\Sale;
use Modules\POS\Models\SaleItem;
use Modules\POS\Repositories\PosSessionRepository;
use Modules\POS\Repositories\SaleRepository;
use Modules\POS\Repositories\PaymentRepository;
use Modules\Menu\Models\MenuItem;

class PosService
{
    public function __construct(
        protected PosSessionRepository $sessionRepo,
        protected SaleRepository $saleRepo,
        protected PaymentRepository $paymentRepo,
    ) {}

    public function startSession(array $data): \Modules\POS\Models\PosSession
    {
        return $this->sessionRepo->create($data);
    }

    public function closeSession(int $id, array $data): \Modules\POS\Models\PosSession
    {
        $session = $this->sessionRepo->find($id);
        $expectedBalance = $this->calculateExpectedBalance($id);

        return $this->sessionRepo->update($id, array_merge($data, [
            'expected_balance' => $expectedBalance,
            'difference' => ($data['closing_balance'] ?? 0) - $expectedBalance,
            'status' => 'closed',
        ]));
    }

    public function createSale(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $invoiceNumber = Sale::generateInvoiceNumber();
            $data['invoice_number'] = $invoiceNumber;
            $data['payment_status'] = 'unpaid';
            $data['status'] = 'pending';

            $sale = $this->saleRepo->create($data);

            if (!empty($data['items'])) {
                $this->addItemsToSale($sale, $data['items']);
            }

            $this->recalculateSale($sale->fresh());

            if (!empty($data['table_id'])) {
                try {
                    $table = \Modules\TableManagement\Models\Table::find($data['table_id']);
                    if ($table) {
                        $table->update(['status' => 'occupied']);
                    }
                } catch (\Exception $e) {}
            }

            return $sale->fresh(['items.menuItem', 'payments', 'table', 'customer', 'user']);
        });
    }

    public function addItemsToSale(Sale $sale, array $items): void
    {
        foreach ($items as $item) {
            $menuItem = MenuItem::findOrFail($item['menu_item_id']);

            $saleItem = SaleItem::create([
                'sale_id' => $sale->id,
                'menu_item_id' => $menuItem->id,
                'item_name' => $menuItem->name,
                'quantity' => $item['quantity'] ?? 1,
                'unit_price' => $menuItem->price,
                'discount_amount' => $item['discount_amount'] ?? 0,
                'tax_amount' => $item['tax_amount'] ?? 0,
                'total' => ($menuItem->price * ($item['quantity'] ?? 1)) - ($item['discount_amount'] ?? 0),
                'notes' => $item['notes'] ?? null,
            ]);
        }
    }

    public function removeSaleItem(int $saleId, int $itemId): void
    {
        SaleItem::where('sale_id', $saleId)->where('id', $itemId)->delete();
        $this->recalculateSale(Sale::find($saleId));
    }

    public function recalculateSale(Sale $sale): void
    {
        $subtotal = $sale->items->sum('total');
        $discountAmount = (float) $sale->discount_amount;

        if ($sale->discount_percent > 0 && $discountAmount === 0) {
            $discountAmount = $subtotal * ($sale->discount_percent / 100);
        }

        $taxAmount = $sale->tax_percent > 0
            ? ($subtotal - $discountAmount) * ($sale->tax_percent / 100)
            : $sale->items->sum('tax_amount');

        $total = $subtotal - $discountAmount + $taxAmount + (float) $sale->delivery_charge + (float) $sale->tip_amount;

        $sale->update([
            'subtotal' => round($subtotal, 2),
            'discount_amount' => round($discountAmount, 2),
            'tax_amount' => round($taxAmount, 2),
            'total' => round(max(0, $total), 2),
        ]);
    }

    public function processPayment(Sale $sale, array $paymentData): Sale
    {
        return DB::transaction(function () use ($sale, $paymentData) {
            $payment = $this->paymentRepo->create(array_merge($paymentData, [
                'sale_id' => $sale->id,
                'restaurant_id' => $sale->restaurant_id,
                'branch_id' => $sale->branch_id,
                'user_id' => auth()->id(),
            ]));

            $totalPaid = $sale->payments()->sum('amount') + $payment->amount;
            $change = max(0, $totalPaid - $sale->total);

            $paymentStatus = 'unpaid';
            if ($totalPaid >= $sale->total) {
                $paymentStatus = 'paid';
            } elseif ($totalPaid > 0) {
                $paymentStatus = 'partial';
            }

            $newStatus = $paymentStatus === 'paid' ? 'completed' : $sale->status;

            $sale->update([
                'amount_paid' => $totalPaid,
                'change_amount' => $change,
                'payment_status' => $paymentStatus,
                'status' => $newStatus,
            ]);

            if ($newStatus === 'completed' && $sale->table_id) {
                try {
                    $table = \Modules\TableManagement\Models\Table::find($sale->table_id);
                    if ($table) {
                        $table->update(['status' => 'available']);
                    }
                } catch (\Exception $e) {}
            }

            return $sale->fresh(['items.menuItem', 'payments', 'table', 'customer', 'user']);
        });
    }

    public function holdOrder(int $saleId): Sale
    {
        $sale = $this->saleRepo->update($saleId, ['status' => 'pending']);

        if ($sale->table_id) {
            try {
                $table = \Modules\TableManagement\Models\Table::find($sale->table_id);
                if ($table) {
                    $table->update(['status' => 'available']);
                }
            } catch (\Exception $e) {}
        }

        return $sale->fresh(['items.menuItem', 'payments', 'table', 'customer', 'user']);
    }

    public function recallOrder(int $saleId): Sale
    {
        $sale = $this->saleRepo->update($saleId, ['status' => 'confirmed']);

        if ($sale->table_id) {
            try {
                $table = \Modules\TableManagement\Models\Table::find($sale->table_id);
                if ($table) {
                    $table->update(['status' => 'occupied']);
                }
            } catch (\Exception $e) {}
        }

        return $sale->fresh(['items.menuItem', 'payments', 'table', 'customer', 'user']);
    }

    public function cancelSale(int $saleId): Sale
    {
        $sale = $this->saleRepo->update($saleId, ['status' => 'cancelled']);

        if ($sale->table_id) {
            try {
                $table = \Modules\TableManagement\Models\Table::find($sale->table_id);
                if ($table) {
                    $table->update(['status' => 'available']);
                }
            } catch (\Exception $e) {}
        }

        return $sale;
    }

    public function processRefund(Sale $sale, array $refundData): Sale
    {
        return DB::transaction(function () use ($sale, $refundData) {
            $refundAmount = (float) ($refundData['amount'] ?? 0);

            if ($refundAmount <= 0 || $refundAmount > $sale->amount_paid) {
                throw new \Exception('Invalid refund amount');
            }

            $payment = $this->paymentRepo->create([
                'sale_id' => $sale->id,
                'restaurant_id' => $sale->restaurant_id,
                'branch_id' => $sale->branch_id,
                'user_id' => auth()->id(),
                'payment_method' => $refundData['payment_method'] ?? 'cash',
                'type' => 'refund',
                'amount' => $refundAmount,
                'notes' => $refundData['notes'] ?? null,
                'refund_reason' => $refundData['refund_reason'] ?? null,
            ]);

            $totalRefunded = $sale->payments()->where('type', 'refund')->sum('amount');
            $newAmountPaid = max(0, $sale->amount_paid - $refundAmount);

            $paymentStatus = $newAmountPaid <= 0 ? 'refunded' : 'partial';
            if ($newAmountPaid >= $sale->total) {
                $paymentStatus = 'paid';
            }

            $sale->update([
                'refund_amount' => $totalRefunded,
                'amount_paid' => $newAmountPaid,
                'payment_status' => $paymentStatus,
                'status' => $paymentStatus === 'refunded' ? 'refunded' : $sale->status,
            ]);

            return $sale->fresh(['items.menuItem', 'payments', 'table', 'customer', 'user']);
        });
    }

    protected function calculateExpectedBalance(int $sessionId): float
    {
        $session = $this->sessionRepo->find($sessionId);
        $totalSales = $session->sales()->where('payment_status', 'paid')->sum('amount_paid');
        return $session->opening_balance + $totalSales;
    }
}
