<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\ExpenseCategory;
use Illuminate\Support\Arr;

class ExpenseCategoryService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = ExpenseCategory::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('code', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        return $query->orderBy('name')->paginate($perPage);
    }

    public function find(int $id): ?ExpenseCategory
    {
        return ExpenseCategory::with(['account'])->find($id);
    }

    public function create(array $data): ExpenseCategory
    {
        return ExpenseCategory::create($data);
    }

    public function update(int $id, array $data): ExpenseCategory
    {
        $category = ExpenseCategory::findOrFail($id);
        $category->update($data);
        return $category;
    }

    public function delete(int $id): void
    {
        $category = ExpenseCategory::findOrFail($id);
        $category->delete();
    }

    public function all(int $restaurantId): array
    {
        return ExpenseCategory::forRestaurant($restaurantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->toArray();
    }
}
