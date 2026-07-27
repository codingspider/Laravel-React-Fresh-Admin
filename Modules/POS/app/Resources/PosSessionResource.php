<?php

namespace Modules\POS\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PosSessionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'user_id' => $this->user_id,
            'opening_balance' => $this->opening_balance,
            'closing_balance' => $this->closing_balance,
            'expected_balance' => $this->expected_balance,
            'difference' => $this->difference,
            'status' => $this->status,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', fn() => ['id' => $this->user->id, 'name' => $this->user->name]),
            'branch' => $this->whenLoaded('branch', fn() => ['id' => $this->branch->id, 'name' => $this->branch->name]),
            'sales_count' => $this->whenCounted('sales'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
