<?php

namespace Modules\Menu\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ModifierGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'name' => $this->name,
            'is_required' => $this->is_required,
            'min_selections' => $this->min_selections,
            'max_selections' => $this->max_selections,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'modifiers' => ModifierResource::collection($this->whenLoaded('modifiers')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
