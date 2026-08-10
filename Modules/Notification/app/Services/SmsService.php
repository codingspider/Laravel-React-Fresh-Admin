<?php

namespace Modules\Notification\Services;

use Illuminate\Support\Facades\Log;
use Modules\Notification\Models\NotificationSetting;
use RuntimeException;
use Twilio\Rest\Client;

class SmsService
{
    public function __construct(protected NotificationSettingService $settings)
    {
    }

    /**
     * Send a message through a channel (sms|whatsapp) using the branch
     * notification settings, falling back to env() when credentials are
     * not stored per branch.
     *
     * @return array{sid: string, channel: string}
     */
    public function send(string $channel, string $to, string $body, ?int $restaurantId = null, ?int $branchId = null): array
    {
        $restaurantId = $restaurantId ?? getRestaurantId();

        if ($restaurantId === null) {
            throw new RuntimeException('Restaurant could not be resolved for the message.');
        }

        /** @var NotificationSetting $setting */
        $setting = $this->settings->settings($restaurantId, $branchId);
        $config = $setting->config ?? [];

        $enabledKey = $channel === 'whatsapp' ? 'whatsapp_enabled' : 'sms_enabled';

        if (!($config[$enabledKey] ?? false)) {
            throw new RuntimeException(ucfirst($channel) . ' channel is disabled for this branch.');
        }

        $channelConfig = $config[$channel] ?? [];

        $sid = $channelConfig['sid'] ?? config('notification.twilio.sid');
        $token = $channelConfig['token'] ?? config('notification.twilio.token');

        if ($channel === 'whatsapp') {
            $from = $channelConfig['from'] ?? config('notification.twilio.whatsapp_from');
            $from = str_starts_with((string) $from, 'whatsapp:') ? $from : 'whatsapp:' . $from;

            if (!str_starts_with($to, 'whatsapp:')) {
                $to = 'whatsapp:' . $to;
            }
        } else {
            $from = $channelConfig['from'] ?? config('notification.twilio.sms_from');
        }

        if (empty($sid) || empty($token) || empty($from)) {
            throw new RuntimeException('Twilio credentials are not configured for this branch.');
        }

        $twilio = new Client($sid, $token);

        try {
            $message = $twilio->messages->create($to, ['from' => $from, 'body' => $body]);
        } catch (\Throwable $exception) {
            Log::error('Notification send failed', [
                'channel' => $channel,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException($exception->getMessage());
        }

        Log::info('Notification sent', ['channel' => $channel, 'sid' => $message->sid, 'to' => $to]);

        return ['sid' => $message->sid, 'channel' => $channel];
    }
}
