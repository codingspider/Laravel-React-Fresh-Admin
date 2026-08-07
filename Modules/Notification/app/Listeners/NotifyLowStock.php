<?php

namespace Modules\Notification\Listeners;

use Modules\Notification\Notifications\LowStockNotification;
use Modules\Notification\Services\NotificationService;
use Modules\Notification\Events\LowStockAlert;

class NotifyLowStock
{
    public function __construct(protected NotificationService $service) {}

    public function handle(LowStockAlert $event): void
    {
        $this->service->notifyLowStock($event->item, $event->currentStock, $event->restaurantId);
    }
}
