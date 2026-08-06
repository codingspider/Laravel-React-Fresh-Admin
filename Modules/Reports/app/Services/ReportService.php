<?php

namespace Modules\Reports\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Modules\POS\Models\Sale;
use Modules\Purchase\Models\Purchase;
use Modules\Accounting\Models\Expense;
use Modules\Accounting\Models\ExpenseCategory;
use Modules\Branch\Models\Branch;
use Modules\Supplier\Models\Supplier;

class ReportService
{
    /**
     * Generate a sales report (POS / QR orders).
     *
     * @return array<string, mixed>
     */
    public function saleReport(?int $restaurantId, array $filters): array
    {
        $query = Sale::query();

        $this->scopeRestaurant($query, 'restaurant_id', $restaurantId);
        $this->applyDateRange($query, $filters, 'created_at');

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }
        if (!empty($filters['order_type'])) {
            $query->where('order_type', $filters['order_type']);
        }
        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sales = $query
            ->with(['branch:id,name', 'customer:id,name,phone', 'table:id,name'])
            ->orderBy('created_at')
            ->get();

        $rows = $sales->map(fn (Sale $sale) => $this->saleRow($sale))->values()->all();

        $subtotal = array_sum(array_column($rows, 'subtotal'));
        $discount = array_sum(array_column($rows, 'discount_amount'));
        $tax = array_sum(array_column($rows, 'tax_amount'));
        $total = array_sum(array_column($rows, 'total'));
        $paid = array_sum(array_column($rows, 'amount_paid'));
        $orderCount = count($rows);

        return [
            'period' => $this->period($filters),
            'summary' => [
                'total_orders' => $orderCount,
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discount, 2),
                'tax_amount' => round($tax, 2),
                'total_sales' => round($total, 2),
                'amount_paid' => round($paid, 2),
                'average_order_value' => $orderCount > 0 ? round($total / $orderCount, 2) : 0,
            ],
            'by_order_type' => $this->groupCountTotal($rows, 'order_type'),
            'by_payment_status' => $this->groupCountTotal($rows, 'payment_status'),
            'rows' => $rows,
        ];
    }

    /**
     * Generate a purchase report.
     *
     * @return array<string, mixed>
     */
    public function purchaseReport(?int $restaurantId, array $filters): array
    {
        $query = Purchase::query();

        $this->scopeRestaurant($query, 'restaurant_id', $restaurantId);
        $this->applyDateRange($query, $filters, 'purchase_date');

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }
        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $purchases = $query
            ->with(['supplier:id,name', 'branch:id,name'])
            ->orderBy('purchase_date')
            ->get();

        $rows = $purchases->map(fn (Purchase $purchase) => $this->purchaseRow($purchase))->values()->all();

        $subtotal = array_sum(array_column($rows, 'subtotal'));
        $discount = array_sum(array_column($rows, 'discount_amount'));
        $tax = array_sum(array_column($rows, 'tax_amount'));
        $shipping = array_sum(array_column($rows, 'shipping_cost'));
        $total = array_sum(array_column($rows, 'total'));
        $paid = array_sum(array_column($rows, 'paid_amount'));
        $due = array_sum(array_column($rows, 'due_amount'));

        return [
            'period' => $this->period($filters),
            'summary' => [
                'total_purchases' => count($rows),
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discount, 2),
                'tax_amount' => round($tax, 2),
                'shipping_cost' => round($shipping, 2),
                'total_amount' => round($total, 2),
                'paid_amount' => round($paid, 2),
                'due_amount' => round($due, 2),
            ],
            'by_status' => $this->groupCountTotal($rows, 'status'),
            'rows' => $rows,
        ];
    }

    /**
     * Generate a tax report (output tax from sales, input tax from purchases).
     *
     * @return array<string, mixed>
     */
    public function taxReport(?int $restaurantId, array $filters): array
    {
        $outputRows = [];
        $inputRows = [];

        $salesQuery = Sale::query();
        $this->scopeRestaurant($salesQuery, 'restaurant_id', $restaurantId);
        $this->applyDateRange($salesQuery, $filters, 'created_at');
        if (!empty($filters['branch_id'])) {
            $salesQuery->where('branch_id', $filters['branch_id']);
        }
        $salesQuery->where('tax_amount', '>', 0);
        foreach ($salesQuery->get(['id', 'invoice_number', 'created_at', 'tax_amount', 'tax_percent']) as $sale) {
            $outputRows[] = [
                'date' => $sale->created_at?->format('Y-m-d H:i'),
                'type' => 'sale',
                'reference' => $sale->invoice_number,
                'tax_rate' => (float) $sale->tax_percent,
                'tax_amount' => (float) $sale->tax_amount,
            ];
        }

        $purchasesQuery = Purchase::query();
        $this->scopeRestaurant($purchasesQuery, 'restaurant_id', $restaurantId);
        $this->applyDateRange($purchasesQuery, $filters, 'purchase_date');
        if (!empty($filters['branch_id'])) {
            $purchasesQuery->where('branch_id', $filters['branch_id']);
        }
        $purchasesQuery->where('tax_amount', '>', 0);
        foreach ($purchasesQuery->get(['id', 'invoice_number', 'purchase_date', 'tax_amount']) as $purchase) {
            $inputRows[] = [
                'date' => $purchase->purchase_date?->format('Y-m-d'),
                'type' => 'purchase',
                'reference' => $purchase->invoice_number ?: $purchase->reference_number,
                'tax_rate' => null,
                'tax_amount' => (float) $purchase->tax_amount,
            ];
        }

        $rows = array_merge($outputRows, $inputRows);
        usort($rows, fn (array $a, array $b) => strcmp($a['date'] ?? '', $b['date'] ?? ''));

        $outputTax = array_sum(array_column($outputRows, 'tax_amount'));
        $inputTax = array_sum(array_column($inputRows, 'tax_amount'));

        return [
            'period' => $this->period($filters),
            'summary' => [
                'output_tax' => round($outputTax, 2),
                'input_tax' => round($inputTax, 2),
                'net_tax' => round($outputTax - $inputTax, 2),
                'output_entries' => count($outputRows),
                'input_entries' => count($inputRows),
            ],
            'rows' => $rows,
        ];
    }

    /**
     * Generate an expense report.
     *
     * @return array<string, mixed>
     */
    public function expenseReport(?int $restaurantId, array $filters): array
    {
        $query = Expense::query();

        $this->scopeRestaurant($query, 'restaurant_id', $restaurantId);
        $this->applyDateRange($query, $filters, 'expense_date');

        if (!empty($filters['expense_category_id'])) {
            $query->where('accounting_expense_category_id', $filters['expense_category_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }
        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        $expenses = $query
            ->with(['category:id,name', 'branch:id,name', 'supplier:id,name'])
            ->orderBy('expense_date')
            ->get();

        $rows = $expenses->map(fn (Expense $expense) => $this->expenseRow($expense))->values()->all();

        $total = array_sum(array_column($rows, 'amount'));

        return [
            'period' => $this->period($filters),
            'summary' => [
                'total_expenses' => count($rows),
                'total_amount' => round($total, 2),
            ],
            'by_category' => $this->groupCountTotal($rows, 'category_name'),
            'rows' => $rows,
        ];
    }

    /**
     * Filter option lists used by the report filter bars.
     *
     * @return array<string, mixed>
     */
    public function meta(?int $restaurantId): array
    {
        $branches = Branch::query()
            ->when($restaurantId, fn ($q) => $q->where('restaurant_id', $restaurantId))
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $suppliers = Supplier::query()
            ->when($restaurantId, fn ($q) => $q->where('restaurant_id', $restaurantId))
            ->orderBy('name')
            ->get(['id', 'name']);

        $expenseCategories = ExpenseCategory::query()
            ->when($restaurantId, fn ($q) => $q->where('restaurant_id', $restaurantId))
            ->orderBy('name')
            ->get(['id', 'name']);

        return [
            'branches' => $branches,
            'suppliers' => $suppliers,
            'expense_categories' => $expenseCategories,
            'order_types' => ['dine_in', 'takeaway', 'delivery', 'pickup', 'qr_ordering'],
            'purchase_order_types' => ['purchase_order', 'direct_purchase'],
            'payment_methods' => ['cash', 'card', 'upi', 'online', 'credit', 'loyalty', 'gift_card', 'other'],
            'payment_statuses' => ['paid', 'partial', 'unpaid', 'refunded'],
            'purchase_statuses' => ['active', 'inactive'],
            'sale_statuses' => ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
        ];
    }

    /**
     * Convert a sale model to a report row.
     *
     * @return array<string, mixed>
     */
    protected function saleRow(Sale $sale): array
    {
        return [
            'id' => $sale->id,
            'invoice_number' => $sale->invoice_number,
            'date' => $sale->created_at?->format('Y-m-d H:i'),
            'branch' => $sale->branch?->name,
            'order_type' => $sale->order_type,
            'source' => $sale->source,
            'customer' => $sale->customer?->name ?: ($sale->guest_name ?: 'Walk-in Customer'),
            'phone' => $sale->customer?->phone ?: $sale->guest_phone,
            'table' => $sale->table?->name,
            'subtotal' => (float) $sale->subtotal,
            'discount_amount' => (float) $sale->discount_amount,
            'tax_amount' => (float) $sale->tax_amount,
            'delivery_charge' => (float) $sale->delivery_charge,
            'tip_amount' => (float) $sale->tip_amount,
            'total' => (float) $sale->total,
            'amount_paid' => (float) $sale->amount_paid,
            'payment_status' => $sale->payment_status,
            'status' => $sale->status,
        ];
    }

    /**
     * Convert a purchase model to a report row.
     *
     * @return array<string, mixed>
     */
    protected function purchaseRow(Purchase $purchase): array
    {
        return [
            'id' => $purchase->id,
            'invoice_number' => $purchase->invoice_number ?: $purchase->reference_number ?: ('#' . $purchase->id),
            'date' => $purchase->purchase_date?->format('Y-m-d'),
            'supplier' => $purchase->supplier?->name ?: '-',
            'branch' => $purchase->branch?->name,
            'order_type' => $purchase->order_type,
            'subtotal' => (float) $purchase->subtotal,
            'discount_amount' => (float) $purchase->discount_amount,
            'tax_amount' => (float) $purchase->tax_amount,
            'shipping_cost' => (float) $purchase->shipping_cost,
            'total' => (float) $purchase->total,
            'paid_amount' => (float) $purchase->paid_amount,
            'due_amount' => (float) $purchase->due_amount,
            'status' => $purchase->status,
        ];
    }

    /**
     * Convert an expense model to a report row.
     *
     * @return array<string, mixed>
     */
    protected function expenseRow(Expense $expense): array
    {
        return [
            'id' => $expense->id,
            'date' => $expense->expense_date?->format('Y-m-d'),
            'reference_number' => $expense->reference_number ?: ('#' . $expense->id),
            'category_name' => $expense->category?->name ?: '-',
            'branch' => $expense->branch?->name,
            'supplier' => $expense->supplier?->name ?: '-',
            'payment_method' => $expense->payment_method ?: '-',
            'amount' => (float) $expense->amount,
            'status' => $expense->status ?: 'completed',
        ];
    }

    /**
     * Apply an optional restaurant scope to a query.
     */
    protected function scopeRestaurant(Builder $query, string $column, ?int $restaurantId): void
    {
        if ($restaurantId) {
            $query->where($column, $restaurantId);
        }
    }

    /**
     * Apply an optional date range to a query.
     */
    protected function applyDateRange(Builder $query, array $filters, string $column): void
    {
        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->whereBetween($column, [$filters['date_from'], $filters['date_to']]);
        } elseif (!empty($filters['date_from'])) {
            $query->whereDate($column, '>=', $filters['date_from']);
        } elseif (!empty($filters['date_to'])) {
            $query->whereDate($column, '<=', $filters['date_to']);
        }
    }

    /**
     * Normalise the requested report period.
     *
     * @return array<string, string|null>
     */
    protected function period(array $filters): array
    {
        return [
            'from' => $filters['date_from'] ?? null,
            'to' => $filters['date_to'] ?? null,
        ];
    }

    /**
     * Group report rows by a key and return count/total per bucket.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function groupCountTotal(array $rows, string $key): array
    {
        $grouped = [];
        foreach ($rows as $row) {
            $bucket = $row[$key] ?? '-';
            $bucket = $bucket === null || $bucket === '' ? '-' : $bucket;
            if (!isset($grouped[$bucket])) {
                $grouped[$bucket] = ['key' => $bucket, 'count' => 0, 'total' => 0.0];
            }
            $grouped[$bucket]['count']++;
            $grouped[$bucket]['total'] += (float) ($row['total'] ?? $row['amount'] ?? 0);
        }

        return array_values($grouped);
    }
}
