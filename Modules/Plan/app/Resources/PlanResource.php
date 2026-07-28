<?php

namespace Modules\Plan\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'billing_cycle' => $this->billing_cycle,
            'branch_limit' => $this->branch_limit,
            'user_limit' => $this->user_limit,
            'invoice_limit' => $this->invoice_limit,
            'is_active' => $this->is_active,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'packages' => \Modules\Package\Resources\PackageResource::collection($this->whenLoaded('packages')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
