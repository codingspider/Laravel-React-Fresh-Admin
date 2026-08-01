<?php

namespace Modules\POS\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'pos_session_id' => $this->pos_session_id,
            'table_id' => $this->table_id,
            'customer_id' => $this->customer_id,
            'user_id' => $this->user_id,
            'invoice_number' => $this->invoice_number,
            'order_type' => $this->order_type,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'discount_percent' => $this->discount_percent,
            'tax_amount' => $this->tax_amount,
            'tax_percent' => $this->tax_percent,
            'delivery_charge' => $this->delivery_charge,
            'tip_amount' => $this->tip_amount,
            'round_off' => $this->round_off,
            'total' => $this->total,
            'amount_paid' => $this->amount_paid,
            'change_amount' => $this->change_amount,
            'payment_status' => $this->payment_status,
            'notes' => $this->notes,
            'kitchen_notes' => $this->kitchen_notes,
            'items' => SaleItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'table' => $this->whenLoaded('table', fn() => ['id' => $this->table->id, 'name' => $this->table->name]),
            'branch' => $this->whenLoaded('branch', fn() => ['id' => $this->branch->id, 'name' => $this->branch->name]),
            'customer' => $this->whenLoaded('customer', fn() => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
                'address' => $this->customer->address,
            ]),
            'user' => $this->whenLoaded('user', fn() => ['id' => $this->user->id, 'name' => $this->user->name]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
