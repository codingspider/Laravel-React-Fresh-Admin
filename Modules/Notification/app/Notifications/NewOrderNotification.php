<?php

namespace Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Modules\Notification\Channels\RestaurantDatabaseChannel;
use Modules\POS\Models\Sale;

class NewOrderNotification extends Notification
{
    use Queueable;

    public function __construct(public Sale $sale) {}

    public function via(object $notifiable): array
    {
        return [RestaurantDatabaseChannel::class];
    }

    public function restaurantId(): ?int
    {
        return $this->sale->restaurant_id;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_order',
            'sale_id' => $this->sale->id,
            'invoice_number' => $this->sale->invoice_number,
            'order_type' => $this->sale->order_type,
            'total' => (float) $this->sale->total,
            'restaurant_id' => $this->sale->restaurant_id,
        ];
    }
}
