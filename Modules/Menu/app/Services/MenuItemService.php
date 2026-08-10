<?php

namespace Modules\Menu\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Branch\Models\Branch;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\Menu\Models\MenuVariant;
use Modules\Menu\Models\Modifier;
use Modules\Menu\Models\ModifierGroup;
use Modules\Menu\Repositories\MenuItemRepository;

class MenuItemService
{
    public function __construct(protected MenuItemRepository $repository) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->repository->delete($id);
    }

    /**
     * Copy the given menu items to another branch, re-mapping their
     * categories and modifier groups to (or creating them in) the target branch.
     * Items that already exist in the target branch are updated in place
     * instead of being duplicated.
     */
    public function assignToBranch(array $itemIds, int $branchId): int
    {
        $branch = Branch::where('id', $branchId)->first();

        if (!$branch) {
            throw ValidationException::withMessages([
                'branch_id' => [trans('menu::module.invalid_input')],
            ]);
        }

        $items = $this->repository->query()
            ->with(['category', 'variants', 'modifierGroups.modifiers'])
            ->whereIn('id', $itemIds)
            ->get();

        if ($items->isEmpty()) {
            throw ValidationException::withMessages([
                'item_ids' => [trans('menu::module.not_found')],
            ]);
        }

        return DB::transaction(function () use ($items, $branchId) {
            $count = 0;

            foreach ($items as $item) {
                $category = $this->resolveCategory($item, $branchId);

                $target = MenuItem::withoutGlobalScopes()
                    ->where('restaurant_id', $item->restaurant_id)
                    ->where('branch_id', $branchId)
                    ->where('name', $item->name)
                    ->first();

                $attributes = [
                    'menu_category_id' => $category->id,
                    'description' => $item->description,
                    'image' => $item->image,
                    'price' => $item->price,
                    'cost_price' => $item->cost_price,
                    'sku' => $item->sku,
                    'barcode' => $item->barcode,
                    'is_vegetarian' => $item->is_vegetarian,
                    'is_vegan' => $item->is_vegan,
                    'is_gluten_free' => $item->is_gluten_free,
                    'is_featured' => $item->is_featured,
                    'is_combo' => $item->is_combo,
                    'preparation_time' => $item->preparation_time,
                    'sort_order' => $item->sort_order,
                    'status' => $item->status,
                    'metadata' => $item->metadata,
                ];

                if ($target) {
                    $target->update($attributes);
                    $target->modifierGroups()->sync($this->resolveModifierGroupIds($item, $branchId));
                    $this->syncVariants($target, $item->variants);
                } else {
                    $target = $this->repository->create(array_merge($attributes, [
                        'restaurant_id' => $item->restaurant_id,
                        'branch_id' => $branchId,
                        'name' => $item->name,
                        'modifier_group_ids' => $this->resolveModifierGroupIds($item, $branchId),
                    ]));

                    foreach ($item->variants as $variant) {
                        MenuVariant::create([
                            'menu_item_id' => $target->id,
                            'name' => $variant->name,
                            'price' => $variant->price,
                            'cost_price' => $variant->cost_price,
                            'sku' => $variant->sku,
                            'is_default' => $variant->is_default,
                            'status' => $variant->status,
                        ]);
                    }
                }

                $count++;
            }

            return $count;
        });
    }

    protected function syncVariants(MenuItem $target, $sourceVariants): void
    {
        $names = $sourceVariants->pluck('name')->all();

        MenuVariant::where('menu_item_id', $target->id)
            ->whereNotIn('name', $names)
            ->delete();

        foreach ($sourceVariants as $variant) {
            MenuVariant::updateOrCreate(
                ['menu_item_id' => $target->id, 'name' => $variant->name],
                [
                    'price' => $variant->price,
                    'cost_price' => $variant->cost_price,
                    'sku' => $variant->sku,
                    'is_default' => $variant->is_default,
                    'status' => $variant->status,
                ]
            );
        }
    }

    protected function resolveCategory(MenuItem $item, int $branchId): MenuCategory
    {
        $sourceCategory = $item->category;
        $name = $sourceCategory?->name ?? $item->name;

        $category = MenuCategory::withoutGlobalScopes()
            ->where('restaurant_id', $item->restaurant_id)
            ->where('branch_id', $branchId)
            ->where('name', $name)
            ->first();

        if ($category) {
            return $category;
        }

        return MenuCategory::create([
            'restaurant_id' => $item->restaurant_id,
            'branch_id' => $branchId,
            'name' => $name,
            'description' => $sourceCategory?->description,
            'image' => $sourceCategory?->image,
            'sort_order' => $sourceCategory?->sort_order ?? 0,
            'status' => $sourceCategory?->status ?? 'active',
        ]);
    }

    protected function resolveModifierGroupIds(MenuItem $item, int $branchId): array
    {
        if ($item->modifierGroups->isEmpty()) {
            return [];
        }

        $groupIds = [];

        foreach ($item->modifierGroups as $group) {
            $targetGroup = ModifierGroup::withoutGlobalScopes()
                ->where('restaurant_id', $item->restaurant_id)
                ->where('branch_id', $branchId)
                ->where('name', $group->name)
                ->first();

            if (!$targetGroup) {
                $targetGroup = ModifierGroup::create([
                    'restaurant_id' => $item->restaurant_id,
                    'branch_id' => $branchId,
                    'name' => $group->name,
                    'is_required' => $group->is_required,
                    'min_selections' => $group->min_selections,
                    'max_selections' => $group->max_selections,
                    'sort_order' => $group->sort_order,
                    'status' => $group->status,
                ]);

                foreach ($group->modifiers as $modifier) {
                    Modifier::create([
                        'modifier_group_id' => $targetGroup->id,
                        'name' => $modifier->name,
                        'price' => $modifier->price,
                        'is_default' => $modifier->is_default,
                        'sort_order' => $modifier->sort_order,
                        'status' => $modifier->status,
                    ]);
                }
            }

            $groupIds[] = $targetGroup->id;
        }

        return $groupIds;
    }
}
