<?php

namespace Modules\TableManagement\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'table_id' => $this->table_id,
            'customer_id' => $this->customer_id,
            'guest_name' => $this->guest_name,
            'guest_phone' => $this->guest_phone,
            'guest_email' => $this->guest_email,
            'guest_count' => $this->guest_count,
            'reservation_date' => $this->reservation_date?->format('Y-m-d'),
            'reservation_time' => $this->reservation_time,
            'reservation_duration' => $this->reservation_duration,
            'status' => $this->status,
            'deposit_amount' => $this->deposit_amount ? (float) $this->deposit_amount : null,
            'special_requests' => $this->special_requests,
            'internal_notes' => $this->internal_notes,
            'table' => new TableResource($this->whenLoaded('table')),
            'branch' => $this->whenLoaded('branch', fn() => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ]),
            'customer' => $this->whenLoaded('customer'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
