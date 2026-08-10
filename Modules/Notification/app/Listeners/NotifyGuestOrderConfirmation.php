<?php

namespace Modules\Notification\Listeners;

use Modules\Notification\Services\NotificationDispatcher;
use Modules\POS\Events\SaleCompleted;

class NotifyGuestOrderConfirmation
{
    public function __construct(protected NotificationDispatcher $dispatcher)
    {
    }

    public function handle(SaleCompleted $event): void
    {
        $sale = $event->sale;

        if (empty($sale->guest_phone)) {
            return;
        }

        $data = [
            'customer' => $sale->guest_name ?: 'Customer',
            'order_id' => $sale->invoice_number,
            'restaurant_name' => $sale->restaurant?->name ?? '',
        ];

        foreach (['sms', 'whatsapp'] as $channel) {
            $this->dispatcher->sendTemplate(
                $channel,
                'Order Confirmation',
                $sale->guest_phone,
                $data,
                $sale->restaurant_id,
                $sale->branch_id
            );
        }
    }
}
