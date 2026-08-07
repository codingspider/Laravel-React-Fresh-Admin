<?php

namespace Modules\Notification\Listeners;

use Modules\Notification\Notifications\OrderRefundedNotification;
use Modules\Notification\Services\NotificationService;
use Modules\POS\Events\SaleRefunded;

class NotifySaleRefunded
{
    public function __construct(protected NotificationService $service) {}

    public function handle(SaleRefunded $event): void
    {
        $this->service->notifySaleRefunded($event->sale, $event->refundData);
    }
}
