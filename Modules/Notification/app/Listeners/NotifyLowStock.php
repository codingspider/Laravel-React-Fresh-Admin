<?php

namespace Modules\Notification\Listeners;

use Modules\Notification\Notifications\LowStockNotification;
use Modules\Notification\Services\NotificationDispatcher;
use Modules\Notification\Services\NotificationService;
use Modules\Notification\Events\LowStockAlert;

class NotifyLowStock
{
    public function __construct(
        protected NotificationService $service,
        protected NotificationDispatcher $dispatcher
    ) {
    }

    public function handle(LowStockAlert $event): void
    {
        $this->service->notifyLowStock($event->item, $event->currentStock, $event->restaurantId);

        $restaurantId = $event->restaurantId ?? $event->item->restaurant_id;

        $restaurant = \Modules\Restaurant\Models\Restaurant::find($restaurantId);

        if ($restaurant === null || empty($restaurant->phone)) {
            return;
        }

        $data = [
            'item' => $event->item->name,
            'stock' => $event->currentStock,
            'restaurant_name' => $restaurant->name,
        ];

        foreach (['sms', 'whatsapp'] as $channel) {
            $this->dispatcher->sendTemplate(
                $channel,
                'Low Stock Alert',
                $restaurant->phone,
                $data,
                $restaurant->id
            );
        }
    }
}
