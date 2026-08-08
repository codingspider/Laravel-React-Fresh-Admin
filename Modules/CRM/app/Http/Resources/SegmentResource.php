<?php

namespace Modules\CRM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SegmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'name' => $this->name,
            'color' => $this->color,
            'description' => $this->description,
            'is_dynamic' => (bool) $this->is_dynamic,
            'rules' => $this->rules,
            'customers_count' => (int) ($this->customers_count ?? 0),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
