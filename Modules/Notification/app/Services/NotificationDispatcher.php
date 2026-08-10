<?php

namespace Modules\Notification\Services;

use Illuminate\Support\Facades\Log;

class NotificationDispatcher
{
    public function __construct(
        protected SmsTemplateService $templates,
        protected SmsService $sms
    ) {
    }

    /**
     * Send a message for a named template on a channel (sms|whatsapp).
     *
     * Resolves the template for the branch (including system defaults),
     * skips silently when it is missing/inactive and never lets a failed
     * send interrupt the surrounding business flow.
     */
    public function sendTemplate(
        string $channel,
        string $templateName,
        string $to,
        array $data = [],
        ?int $restaurantId = null,
        ?int $branchId = null
    ): bool {
        try {
            $restaurantId = $restaurantId ?? getRestaurantId();

            if ($restaurantId === null || $to === '') {
                return false;
            }

            $template = $this->templates->forBranch($restaurantId, $branchId)
                ->where('channel', $channel)
                ->where('name', $templateName)
                ->first();

            if ($template === null || !$template->is_active) {
                return false;
            }

            $this->sms->send(
                $channel,
                $to,
                $this->templates->render($template->body, $data),
                $restaurantId,
                $branchId
            );

            return true;
        } catch (\Throwable $exception) {
            Log::warning('Automatic notification skipped', [
                'channel' => $channel,
                'template' => $templateName,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }
}
