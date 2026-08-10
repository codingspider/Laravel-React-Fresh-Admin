<?php

namespace Modules\Notification\Services;

use Illuminate\Support\Facades\Mail;
use Modules\Notification\Models\NotificationSetting;
use RuntimeException;

class EmailService
{
    public function __construct(protected NotificationSettingService $settings)
    {
    }

    /**
     * Send an email using the SMTP credentials configured for the branch,
     * falling back to environment defaults when no per-branch credentials
     * are stored.
     */
    public function send(string $to, string $subject, string $body, ?int $restaurantId = null, ?int $branchId = null): void
    {
        $restaurantId = $restaurantId ?? getRestaurantId();

        if ($restaurantId === null) {
            throw new RuntimeException('Restaurant could not be resolved for the email.');
        }

        /** @var NotificationSetting $setting */
        $setting = $this->settings->settings($restaurantId, $branchId);
        $config = $setting->config ?? [];

        if (!($config['email_enabled'] ?? false)) {
            throw new RuntimeException('Email channel is disabled for this branch.');
        }

        $email = $config['email'] ?? [];

        $fromAddress = $email['from_email'] ?? config('mail.from.address');
        $fromName = $email['from_name'] ?? config('mail.from.name');

        if (empty($fromAddress)) {
            throw new RuntimeException('SMTP credentials are not configured for this branch.');
        }

        $this->applyRuntimeMailer($email, $fromAddress, $fromName);

        try {
            Mail::raw($body, static function ($message) use ($to, $subject, $fromAddress, $fromName): void {
                $message->to($to)->subject($subject)->from($fromAddress, $fromName);
            });
        } finally {
            $this->restoreMailer();
        }
    }

    /**
     * Point Laravel's mail system at the branch SMTP configuration for the
     * duration of this request.
     */
    protected function applyRuntimeMailer(array $email, string $fromAddress, string $fromName): void
    {
        $this->previousConfig = [
            'mail.default' => config('mail.default'),
            'mail.mailers.smtp' => config('mail.mailers.smtp'),
            'mail.from' => config('mail.from'),
        ];

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp' => [
                'transport' => 'smtp',
                'host' => $email['host'] ?? config('mail.mailers.smtp.host'),
                'port' => (int) ($email['port'] ?? config('mail.mailers.smtp.port')),
                'username' => $email['username'] ?? null,
                'password' => $email['password'] ?? null,
                'encryption' => $email['encryption'] ?? null,
                'timeout' => null,
            ],
            'mail.from' => [
                'address' => $fromAddress,
                'name' => $fromName,
            ],
        ]);

        Mail::forgetMailers();
    }

    protected function restoreMailer(): void
    {
        if ($this->previousConfig === null) {
            return;
        }

        foreach ($this->previousConfig as $key => $value) {
            config([$key => $value]);
        }

        Mail::forgetMailers();

        $this->previousConfig = null;
    }

    /**
     * @var array<string, mixed>|null
     */
    protected ?array $previousConfig = null;
}
