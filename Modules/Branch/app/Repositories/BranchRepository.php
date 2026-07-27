<?php

namespace Modules\Branch\Repositories;

use Modules\Branch\Models\Branch;

class BranchRepository
{
    public function __construct(protected Branch $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Branch
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Branch
    {
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        return $this->model->create($data);
    }

    public function update($id, array $data): Branch
    {
        $branch = $this->find($id);
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        $branch->update($data);
        return $branch;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['restaurant_id'] ?? null, fn($q, $r) => $q->where('restaurant_id', $r))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            }))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getActiveByRestaurant($restaurantId)
    {
        return $this->model->where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->get();
    }

    public function getMainByRestaurant($restaurantId): ?Branch
    {
        return $this->model->where('restaurant_id', $restaurantId)
            ->where('is_main', true)
            ->first();
    }
}
