<?php

namespace Modules\TableManagement\Repositories;

use Modules\TableManagement\Models\Table;

class TableRepository
{
    public function __construct(protected Table $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Table
    {
        return $this->model->with('floor')->findOrFail($id);
    }

    public function create(array $data): Table
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Table
    {
        $table = $this->find($id);
        $table->update($data);
        return $table;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->with('floor')
            ->when($filters['restaurant_id'] ?? null, fn($q, $r) => $q->where('restaurant_id', $r))
            ->when($filters['branch_id'] ?? null, fn($q, $b) => $q->where('branch_id', $b))
            ->when($filters['floor_id'] ?? null, fn($q, $f) => $q->where('floor_id', $f))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('sort_order')
            ->paginate($perPage);
    }

    public function getAvailable($restaurantId, $branchId, $guestCount = null)
    {
        return $this->model->where('restaurant_id', $restaurantId)
            ->where('branch_id', $branchId)
            ->where('status', 'available')
            ->when($guestCount, fn($q, $gc) => $q->where('capacity', '>=', $gc))
            ->orderBy('capacity')
            ->get();
    }

    public function updateStatus($id, string $status): Table
    {
        $table = $this->find($id);
        $table->update(['status' => $status]);
        return $table;
    }
}
