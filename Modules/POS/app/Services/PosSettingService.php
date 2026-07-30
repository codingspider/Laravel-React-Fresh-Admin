<?php

namespace Modules\POS\Services;

use Modules\POS\Repositories\PosSettingRepository;
use Modules\POS\Models\PosSetting;

class PosSettingService
{
    public function __construct(protected PosSettingRepository $repository) {}

    public function getForRestaurant(int $restaurantId, ?int $branchId = null): PosSetting
    {
        return $this->repository->getOrCreateForRestaurant($restaurantId, $branchId);
    }

    public function update(int $restaurantId, array $data, ?int $branchId = null): PosSetting
    {
        $setting = $this->repository->getOrCreateForRestaurant($restaurantId, $branchId);
        $setting = $this->repository->update($setting->id, $data);

        return $setting->fresh();
    }
}
