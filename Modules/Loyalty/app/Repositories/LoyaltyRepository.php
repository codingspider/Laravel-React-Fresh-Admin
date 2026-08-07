<?php

namespace Modules\Loyalty\Repositories;

use Modules\Loyalty\Models\Loyalty;

class LoyaltyRepository
{
    public function __construct(protected Loyalty $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $item = $this->find($id);
        $item->update($data);
        return $item;
    }

    public function delete($id)
    {
        return $this->find($id)->delete();
    }

    public function activeForRestaurant(int $restaurantId): ?Loyalty
    {
        return $this->model
            ->where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->orderByDesc('id')
            ->first();
    }

    public function getOrCreateForRestaurant(int $restaurantId): Loyalty
    {
        return $this->model->firstOrCreate(
            ['restaurant_id' => $restaurantId],
            ['name' => 'Default Loyalty Programme', 'slug' => 'default-loyalty']
        );
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
