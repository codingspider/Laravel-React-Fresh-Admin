<?php

namespace Modules\TableManagement\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FloorResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'name' => $this->name,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'layout_data' => $this->layout_data,
            'status' => $this->status,
            'tables_count' => $this->whenCounted('tables'),
            'tables' => TableResource::collection($this->whenLoaded('tables')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
