<?php

namespace Modules\SuperAdmin\Services;

use Modules\SuperAdmin\Repositories\WebsiteSettingRepository;

class StripeSettingService
{
    private const PREFIX = 'stripe_';

    public function defaults(): array
    {
        return [
            'test_mode' => '1',
            'test_secret_key' => null,
            'test_publishable_key' => null,
            'live_secret_key' => null,
            'live_publishable_key' => null,
            'webhook_secret' => null,
            'enabled' => '0',
            'capture_method' => '1',
        ];
    }

    public function __construct(protected WebsiteSettingRepository $repository) {}

    public function all(): array
    {
        $stored = $this->repository->allAsMap();
        $filtered = [];
        foreach ($this->defaults() as $key => $default) {
            $prefixed = self::PREFIX . $key;
            $filtered[$key] = $stored[$prefixed] ?? $default;
        }
        return $filtered;
    }

    public function update(array $data): void
    {
        $allowed = array_keys($this->defaults());
        $payload = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $allowed)) {
                $payload[self::PREFIX . $key] = $value === null ? null : (string) $value;
            }
        }
        $this->repository->setMany($payload);
    }
}
