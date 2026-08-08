<?php

namespace Modules\CRM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FollowUpResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
            ]),
            'title' => $this->title,
            'notes' => $this->notes,
            'due_at' => $this->due_at?->toISOString(),
            'status' => $this->status,
            'assigned_to' => $this->assigned_to,
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ] : null),
            'completed_at' => $this->completed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
