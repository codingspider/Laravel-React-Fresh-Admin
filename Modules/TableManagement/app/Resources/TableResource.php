<?php

namespace Modules\TableManagement\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TableResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'floor_id' => $this->floor_id,
            'name' => $this->name,
            'capacity' => $this->capacity,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'position' => $this->position,
            'metadata' => $this->metadata,
            'qr_token' => $this->qr_token,
            'qr_code_url' => $this->qr_code_url,
            'qr_image' => $this->qr_image,
            'qr_url' => $this->qr_url,
            'is_available' => $this->isAvailable(),
            'is_occupied' => $this->isOccupied(),
            'is_reserved' => $this->isReserved(),
            'floor' => new FloorResource($this->whenLoaded('floor')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
