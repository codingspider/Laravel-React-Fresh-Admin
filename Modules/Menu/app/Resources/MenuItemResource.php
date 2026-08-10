<?php

namespace Modules\Menu\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'branch' => $this->whenLoaded('branch', fn() => $this->branch?->name),
            'menu_category_id' => $this->menu_category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'image_url' => $this->image ? asset($this->image) : null,
            'price' => (float) $this->price,
            'cost_price' => $this->cost_price ? (float) $this->cost_price : null,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'is_vegetarian' => $this->is_vegetarian,
            'is_vegan' => $this->is_vegan,
            'is_gluten_free' => $this->is_gluten_free,
            'is_featured' => $this->is_featured,
            'is_combo' => $this->is_combo,
            'preparation_time' => $this->preparation_time,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'category' => new MenuCategoryResource($this->whenLoaded('category')),
            'variants' => MenuVariantResource::collection($this->whenLoaded('variants')),
            'modifier_groups' => ModifierGroupResource::collection($this->whenLoaded('modifierGroups')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
