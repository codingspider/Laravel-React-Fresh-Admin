<?php

namespace Modules\Menu\Repositories;

use Modules\Menu\Models\ModifierGroup;

class ModifierGroupRepository
{
    public function __construct(protected ModifierGroup $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): ModifierGroup
    {
        return $this->model->with('modifiers')->findOrFail($id);
    }

    public function create(array $data): ModifierGroup
    {
        $group = $this->model->create(collect($data)->except('modifiers')->toArray());
        if (!empty($data['modifiers'])) {
            foreach ($data['modifiers'] as $modifier) {
                $group->modifiers()->create($modifier);
            }
        }
        return $group;
    }

    public function update($id, array $data): ModifierGroup
    {
        $group = $this->find($id);
        $group->update(collect($data)->except('modifiers')->toArray());
        if (!empty($data['modifiers'])) {
            foreach ($data['modifiers'] as $modifierData) {
                if (isset($modifierData['id'])) {
                    $group->modifiers()->where('id', $modifierData['id'])->update($modifierData);
                } else {
                    $group->modifiers()->create($modifierData);
                }
            }
        }
        return $group;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->with('branch')->withCount('modifiers')
            ->when($filters['restaurant_id'] ?? null, fn($q, $r) => $q->where('restaurant_id', $r))
            ->when($filters['branch_id'] ?? null, fn($q, $b) => $q->where('branch_id', $b))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->orderBy('sort_order')
            ->paginate($perPage);
    }
}
