<?php

namespace Modules\Menu\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuVariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'menu_item_id' => $this->menu_item_id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'cost_price' => $this->cost_price ? (float) $this->cost_price : null,
            'sku' => $this->sku,
            'is_default' => $this->is_default,
            'status' => $this->status,
        ];
    }
}
