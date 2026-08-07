<?php

namespace Modules\Notification\Notifications;

use App\Models\InventoryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Modules\Notification\Channels\RestaurantDatabaseChannel;

class LowStockNotification extends Notification
{
    use Queueable;

    public function __construct(
        public InventoryItem $item,
        public float $currentStock,
        public ?int $restaurantId = null,
    ) {}

    public function via(object $notifiable): array
    {
        return [RestaurantDatabaseChannel::class];
    }

    public function restaurantId(): ?int
    {
        return $this->restaurantId ?? $this->item->restaurant_id;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'low_stock',
            'item_id' => $this->item->id,
            'item_name' => $this->item->name,
            'current_stock' => $this->currentStock,
            'minimum_stock' => (float) $this->item->minimum_stock,
            'restaurant_id' => $this->item->restaurant_id,
        ];
    }
}
