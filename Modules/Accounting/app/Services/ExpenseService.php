<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\Expense;
use Modules\Accounting\Services\ExpenseCategoryService;
use Illuminate\Support\Arr;

class ExpenseService
{
    public function __construct(
        protected ExpenseCategoryService $categoryService,
        protected JournalService $journalService
    ) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = Expense::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('reference_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('notes', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->where('expense_date', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->where('expense_date', '<=', $filters['date_to']);
        });

        return $query->with(['category', 'account', 'supplier', 'branch'])
            ->orderByDesc('expense_date')
            ->paginate($perPage);
    }

    public function find(int $id): ?Expense
    {
        return Expense::with(['category', 'account', 'supplier', 'branch'])->find($id);
    }

    public function create(array $data): Expense
    {
        $expense = Expense::create($data);
        $this->journalService->createJournalForExpense($expense);
        return $expense->fresh();
    }

    public function update(int $id, array $data): Expense
    {
        $expense = Expense::findOrFail($id);
        $expense->update($data);
        return $expense;
    }

    public function delete(int $id): void
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
    }

    public function summary(array $filters = []): array
    {
        $query = Expense::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->where('expense_date', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->where('expense_date', '<=', $filters['date_to']);
        });

        return [
            'total' => $query->sum('amount'),
            'by_category' => $query->selectRaw('accounting_expense_category_id, SUM(amount) as total')
                ->groupBy('accounting_expense_category_id')
                ->pluck('total', 'accounting_expense_category_id')
                ->toArray(),
        ];
    }
}
