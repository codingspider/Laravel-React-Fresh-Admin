<?php

namespace Modules\Notification\Listeners;

use Modules\Notification\Notifications\NewOrderNotification;
use Modules\Notification\Services\NotificationService;
use Modules\POS\Events\SaleCompleted;

class NotifySaleCompleted
{
    public function __construct(protected NotificationService $service) {}

    public function handle(SaleCompleted $event): void
    {
        $this->service->notifySaleCompleted($event->sale);
    }
}
