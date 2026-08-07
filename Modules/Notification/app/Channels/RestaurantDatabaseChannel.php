<?php

namespace Modules\Notification\Channels;

use Illuminate\Notifications\Channels\DatabaseChannel;
use Illuminate\Notifications\Notification;

class RestaurantDatabaseChannel extends DatabaseChannel
{
    protected function buildPayload($notifiable, Notification $notification): array
    {
        $payload = parent::buildPayload($notifiable, $notification);

        if (method_exists($notification, 'restaurantId')) {
            $payload['restaurant_id'] = $notification->restaurantId();
        }

        return $payload;
    }
}
