<?php

namespace Modules\POS\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sale_id' => $this->sale_id,
            'menu_item_id' => $this->menu_item_id,
            'item_name' => $this->item_name,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'discount_amount' => $this->discount_amount,
            'tax_amount' => $this->tax_amount,
            'total' => $this->total,
            'notes' => $this->notes,
            'modifiers' => $this->modifiers,
            'menu_item' => $this->whenLoaded('menu_item', fn() => [
                'id' => $this->menu_item->id,
                'name' => $this->menu_item->name,
                'price' => $this->menu_item->price,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
