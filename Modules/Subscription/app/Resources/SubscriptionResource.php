<?php

namespace Modules\Subscription\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'plan_id' => $this->plan_id,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'trial_ends_at' => $this->trial_ends_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'payment_amount' => $this->payment_amount,
            'payment_date' => $this->payment_date?->toISOString(),
            'payment_reference' => $this->payment_reference,
            'notes' => $this->notes,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'restaurant' => $this->whenLoaded('restaurant', fn () => [
                'id' => $this->restaurant->id,
                'name' => $this->restaurant->name,
            ]),
            'plan' => $this->whenLoaded('plan', fn () => [
                'id' => $this->plan->id,
                'name' => $this->plan->name,
                'slug' => $this->plan->slug,
                'price' => $this->plan->price,
                'billing_cycle' => $this->plan->billing_cycle,
                'packages' => \Modules\Package\Resources\PackageResource::collection($this->plan->whenLoaded('packages')),
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
