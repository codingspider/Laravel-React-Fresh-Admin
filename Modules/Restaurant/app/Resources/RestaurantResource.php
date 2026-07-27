<?php

namespace Modules\Restaurant\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'zip_code' => $this->zip_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'logo' => $this->logo,
            'cover_image' => $this->cover_image,
            'timezone' => $this->timezone,
            'currency' => $this->currency,
            'currency_symbol' => $this->currency_symbol,
            'tax_rate' => (float) $this->tax_rate,
            'tax_name' => $this->tax_name,
            'tax_inclusive' => $this->tax_inclusive,
            'working_hours' => $this->working_hours,
            'holidays' => $this->holidays,
            'payment_methods' => $this->payment_methods,
            'receipt_settings' => $this->receipt_settings,
            'notification_settings' => $this->notification_settings,
            'pos_settings' => $this->pos_settings,
            'metadata' => $this->metadata,
            'status' => $this->status,
            'full_address' => $this->full_address,
            'trial_ends_at' => $this->trial_ends_at?->toISOString(),
            'is_active' => $this->isActive(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
