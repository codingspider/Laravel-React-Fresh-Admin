<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\Income;
use Modules\Accounting\Services\AccountService;
use Illuminate\Support\Arr;

class IncomeService
{
    public function __construct(
        protected AccountService $accountService,
        protected JournalService $journalService
    ) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = Income::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('reference_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('category', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('notes', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['source']), function ($q) use ($filters) {
            $q->bySource($filters['source']);
        });

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->where('income_date', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->where('income_date', '<=', $filters['date_to']);
        });

        return $query->with(['account', 'branch'])
            ->orderByDesc('income_date')
            ->paginate($perPage);
    }

    public function find(int $id): ?Income
    {
        return Income::with(['account', 'branch'])->find($id);
    }

    public function create(array $data): Income
    {
        $income = Income::create($data);
        $this->journalService->createJournalForIncome($income);
        return $income->fresh();
    }

    public function update(int $id, array $data): Income
    {
        $income = Income::findOrFail($id);
        $income->update($data);
        return $income;
    }

    public function delete(int $id): void
    {
        $income = Income::findOrFail($id);
        $income->delete();
    }

    public function summary(array $filters = []): array
    {
        $query = Income::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->where('income_date', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->where('income_date', '<=', $filters['date_to']);
        });

        return [
            'total' => $query->sum('amount'),
            'pos_sales' => $query->bySource('pos_sale')->sum('amount'),
            'manual_income' => $query->bySource('manual_income')->sum('amount'),
            'other_income' => $query->bySource('other_income')->sum('amount'),
        ];
    }
}
