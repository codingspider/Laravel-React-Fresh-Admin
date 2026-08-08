<?php

namespace Modules\CRM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CrmCustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'name' => $this->name,
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'notes' => $this->notes,
            'dob' => $this->dob?->toDateString(),
            'anniversary' => $this->anniversary?->toDateString(),
            'gender' => $this->gender,
            'favourite_food' => $this->favourite_food,
            'source' => $this->source,
            'lead_status' => $this->lead_status,
            'last_visit_at' => $this->last_visit_at?->toISOString(),
            'total_spent' => (float) $this->total_spent,
            'total_orders' => (int) $this->total_orders,
            'is_active' => (bool) $this->is_active,
            'segments' => $this->whenLoaded('segments', fn () => $this->segments->map(fn ($segment) => [
                'id' => $segment->id,
                'name' => $segment->name,
                'color' => $segment->color,
            ])),
            'follow_ups' => $this->whenLoaded('followUps', fn () => FollowUpResource::collection($this->followUps)),
            'notes' => $this->whenLoaded('crmNotes', fn () => NoteResource::collection($this->crmNotes)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
