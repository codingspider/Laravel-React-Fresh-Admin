<?php

namespace Modules\POS\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PosSettingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'branch_id' => $this->branch_id,
            'order_types' => $this->order_types,
            'payment_methods' => $this->payment_methods,
            'default_tax_rate' => (float) $this->default_tax_rate,
            'default_tax_name' => $this->default_tax_name,
            'enable_discount' => $this->enable_discount,
            'enable_coupon' => $this->enable_coupon,
            'enable_shipping' => $this->enable_shipping,
            'enable_tip' => $this->enable_tip,
            'enable_notes' => $this->enable_notes,
            'enable_kitchen_notes' => $this->enable_kitchen_notes,
            'enable_table_management' => $this->enable_table_management,
            'enable_customer' => $this->enable_customer,
            'active_order_types' => $this->active_order_types,
            'active_payment_methods' => $this->active_payment_methods,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
