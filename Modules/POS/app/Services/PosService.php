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

            $sale = $this->saleRepo->create($data);

            if (!empty($data['items'])) {
                $this->addItemsToSale($sale, $data['items']);
            }

            $this->recalculateSale($sale->fresh());

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
        $discountAmount = $sale->discount_amount;
        $taxAmount = $sale->items->sum('tax_amount');
        $total = $subtotal - $discountAmount + $taxAmount + $sale->delivery_charge + $sale->tip_amount;

        $sale->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => round($total, 2),
        ]);
    }

    public function processPayment(Sale $sale, array $paymentData): Sale
    {
        return DB::transaction(function () use ($sale, $paymentData) {
            $payment = $this->paymentRepo->create(array_merge($paymentData, [
                'sale_id' => $sale->id,
            ]));

            $totalPaid = $sale->payments()->sum('amount') + $payment->amount;
            $change = max(0, $totalPaid - $sale->total);

            $paymentStatus = 'unpaid';
            if ($totalPaid >= $sale->total) {
                $paymentStatus = 'paid';
            } elseif ($totalPaid > 0) {
                $paymentStatus = 'partial';
            }

            $sale->update([
                'amount_paid' => $totalPaid,
                'change_amount' => $change,
                'payment_status' => $paymentStatus,
                'status' => $paymentStatus === 'paid' ? 'completed' : $sale->status,
            ]);

            return $sale->fresh(['items.menuItem', 'payments', 'table', 'customer', 'user']);
        });
    }

    public function holdOrder(int $saleId): Sale
    {
        return $this->saleRepo->update($saleId, ['status' => 'pending']);
    }

    public function recallOrder(int $saleId): Sale
    {
        return $this->saleRepo->update($saleId, ['status' => 'confirmed']);
    }

    public function cancelSale(int $saleId): Sale
    {
        return $this->saleRepo->update($saleId, ['status' => 'cancelled']);
    }

    protected function calculateExpectedBalance(int $sessionId): float
    {
        $session = $this->sessionRepo->find($sessionId);
        $totalSales = $session->sales()->where('payment_status', 'paid')->sum('amount_paid');
        return $session->opening_balance + $totalSales;
    }
}
