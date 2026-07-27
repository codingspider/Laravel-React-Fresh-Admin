<?php

namespace Modules\POS\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sale_id' => $this->sale_id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'user_id' => $this->user_id,
            'payment_method' => $this->payment_method,
            'reference_number' => $this->reference_number,
            'amount' => $this->amount,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
