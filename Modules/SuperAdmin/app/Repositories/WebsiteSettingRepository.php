<?php

namespace Modules\SuperAdmin\Repositories;

use Modules\SuperAdmin\Models\WebsiteSetting;

class WebsiteSettingRepository
{
    public function __construct(protected WebsiteSetting $model) {}

    /**
     * All stored settings as a key => value map.
     *
     * @return array<string, string>
     */
    public function allAsMap(): array
    {
        return $this->model->pluck('value', 'key')
            ->map(fn ($v) => $v === null ? null : (string) $v)
            ->toArray();
    }

    /**
     * Upsert a single key/value pair.
     */
    public function set(string $key, ?string $value): void
    {
        $this->model->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Upsert multiple key/value pairs.
     *
     * @param array<string, mixed> $data
     */
    public function setMany(array $data): void
    {
        foreach ($data as $key => $value) {
            $this->set($key, $value === null ? null : (string) $value);
        }
    }
}
