<?php

namespace Modules\Menu\Repositories;

use Modules\Menu\Models\MenuItem;

class MenuItemRepository
{
    public function __construct(protected MenuItem $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): MenuItem
    {
        return $this->model->with(['category', 'branch', 'variants', 'modifierGroups.modifiers'])->findOrFail($id);
    }

    public function create(array $data): MenuItem
    {
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        $item = $this->model->create($data);
        if (!empty($data['modifier_group_ids'])) {
            $item->modifierGroups()->sync($data['modifier_group_ids']);
        }
        return $item;
    }

    public function update($id, array $data): MenuItem
    {
        $item = $this->find($id);
        $item->update(collect($data)->except('modifier_group_ids')->toArray());
        if (isset($data['modifier_group_ids'])) {
            $item->modifierGroups()->sync($data['modifier_group_ids']);
        }
        return $item;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->with(['category', 'branch', 'variants', 'modifierGroups.modifiers'])
            ->when($filters['restaurant_id'] ?? null, fn($q, $r) => $q->where('restaurant_id', $r))
            ->when($filters['branch_id'] ?? null, fn($q, $b) => $q->where('branch_id', $b))
            ->when($filters['category_id'] ?? null, fn($q, $c) => $q->where('menu_category_id', $c))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%")
                    ->orWhere('barcode', 'like', "%{$s}%");
            }))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->when($filters['is_featured'] ?? null, fn($q, $f) => $q->where('is_featured', $f))
            ->when($filters['is_vegetarian'] ?? null, fn($q, $v) => $q->where('is_vegetarian', $v))
            ->orderBy('sort_order')
            ->paginate($perPage);
    }
}
