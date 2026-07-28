<?php

namespace Modules\Plan\Repositories;

use Modules\Plan\Models\Plan;

class PlanRepository
{
    public function __construct(protected Plan $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Plan
    {
        return $this->model->with('packages')->findOrFail($id);
    }

    public function create(array $data): Plan
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Plan
    {
        $item = $this->find($id);
        $item->update($data);
        return $item;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model
            ->with('packages')
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%");
            }))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['billing_cycle'] ?? null, fn ($q, $cycle) => $q->where('billing_cycle', $cycle))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
