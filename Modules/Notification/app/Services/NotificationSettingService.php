<?php

namespace Modules\Notification\Services;

use Modules\Branch\Models\Branch;
use Modules\Notification\Models\NotificationSetting;

class NotificationSettingService
{
    /**
     * Resolve the branch that settings apply to.
     *
     * Priority: explicit branch_id -> authenticated user's branch -> the
     * restaurant's main branch.
     */
    public function resolveBranchId(int $restaurantId, ?int $branchId = null): ?int
    {
        if ($branchId === null) {
            $branchId = getBranchId();
        }

        if ($branchId === null) {
            $branchId = Branch::where('restaurant_id', $restaurantId)
                ->where('is_main', true)
                ->value('id');
        }

        return $branchId;
    }

    /**
     * Get (or create) the notification settings for a restaurant branch.
     */
    public function settings(int $restaurantId, ?int $branchId = null): NotificationSetting
    {
        $branchId = $this->resolveBranchId($restaurantId, $branchId);

        return NotificationSetting::firstOrCreate(
            ['restaurant_id' => $restaurantId, 'branch_id' => $branchId],
            ['config' => $this->defaults()]
        );
    }

    /**
     * Merge and persist the branch notification settings.
     */
    public function update(int $restaurantId, ?int $branchId, array $config): NotificationSetting
    {
        $setting = $this->settings($restaurantId, $branchId);

        $merged = array_replace_recursive($this->defaults(), $setting->config ?? [], $config);

        $setting->update(['config' => $merged]);

        return $setting->refresh();
    }

    /**
     * Default notification configuration for a branch.
     */
    public function defaults(): array
    {
        return [
            'email_enabled' => true,
            'sms_enabled' => false,
            'whatsapp_enabled' => false,
            'email' => [
                'host' => '',
                'port' => 587,
                'username' => '',
                'password' => '',
                'encryption' => 'tls',
                'from_email' => '',
                'from_name' => '',
            ],
            'sms' => [
                'provider' => 'twilio',
                'sid' => '',
                'token' => '',
                'from' => '',
            ],
            'whatsapp' => [
                'sid' => '',
                'token' => '',
                'from' => '',
            ],
        ];
    }
}
