<?php

namespace Modules\Restaurant\Repositories;

use Modules\Restaurant\Models\Restaurant;

class RestaurantRepository
{
    public function __construct(protected Restaurant $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Restaurant
    {
        return $this->model->findOrFail($id);
    }

    public function findBySlug(string $slug): Restaurant
    {
        return $this->model->where('slug', $slug)->findOrFail();
    }

    public function create(array $data): Restaurant
    {
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        return $this->model->create($data);
    }

    public function update($id, array $data): Restaurant
    {
        $restaurant = $this->find($id);
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        $restaurant->update($data);
        return $restaurant;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            }))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->when($filters['owner_id'] ?? null, fn($q, $o) => $q->where('owner_id', $o))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getActive()
    {
        return $this->model->where('status', 'active')->get();
    }

    public function getByOwner($ownerId)
    {
        return $this->model->where('owner_id', $ownerId)->get();
    }
}
