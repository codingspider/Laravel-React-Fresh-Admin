<?php

namespace Modules\Menu\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ModifierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'modifier_group_id' => $this->modifier_group_id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'is_default' => $this->is_default,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
        ];
    }
}
