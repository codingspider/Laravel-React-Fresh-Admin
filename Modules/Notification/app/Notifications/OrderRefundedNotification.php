<?php

namespace Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Modules\Notification\Channels\RestaurantDatabaseChannel;
use Modules\POS\Models\Sale;

class OrderRefundedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Sale $sale,
        public array $refundData,
    ) {}

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
            'type' => 'order_refunded',
            'sale_id' => $this->sale->id,
            'invoice_number' => $this->sale->invoice_number,
            'refund_amount' => (float) ($this->refundData['refund_amount'] ?? $this->sale->refund_amount ?? 0),
            'restaurant_id' => $this->sale->restaurant_id,
        ];
    }
}
