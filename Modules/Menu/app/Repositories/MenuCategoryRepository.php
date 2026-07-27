<?php

namespace Modules\Menu\Repositories;

use Modules\Menu\Models\MenuCategory;

class MenuCategoryRepository
{
    public function __construct(protected MenuCategory $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): MenuCategory
    {
        return $this->model->with('children')->findOrFail($id);
    }

    public function create(array $data): MenuCategory
    {
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        return $this->model->create($data);
    }

    public function update($id, array $data): MenuCategory
    {
        $category = $this->find($id);
        $category->update($data);
        return $category;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->withCount('menuItems')
            ->when($filters['restaurant_id'] ?? null, fn($q, $r) => $q->where('restaurant_id', $r))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->orderBy('sort_order')
            ->paginate($perPage);
    }

    public function getTree($restaurantId)
    {
        return $this->model->with(['children.menuItems' => function ($q) {
            $q->where('status', 'active');
        }])
            ->where('restaurant_id', $restaurantId)
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();
    }
}
