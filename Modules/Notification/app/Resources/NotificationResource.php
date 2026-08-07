<?php

namespace Modules\Notification\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->data;

        return [
            'id' => $this->id,
            'type' => $data['type'] ?? class_basename($this->type),
            'sale_id' => $data['sale_id'] ?? null,
            'invoice_number' => $data['invoice_number'] ?? null,
            'order_type' => $data['order_type'] ?? null,
            'item_id' => $data['item_id'] ?? null,
            'item_name' => $data['item_name'] ?? null,
            'total' => $data['total'] ?? null,
            'refund_amount' => $data['refund_amount'] ?? null,
            'current_stock' => $data['current_stock'] ?? null,
            'minimum_stock' => $data['minimum_stock'] ?? null,
            'restaurant_id' => $data['restaurant_id'] ?? $this->restaurant_id,
            'read' => $this->isRead(),
            'read_at' => $this->read_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
