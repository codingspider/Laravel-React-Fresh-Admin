<?php

namespace Modules\POS\Repositories;

use Modules\POS\Models\PosSetting;

class PosSettingRepository
{
    public function __construct(protected PosSetting $model) {}

    public function find($id): PosSetting
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): PosSetting
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): PosSetting
    {
        $setting = $this->find($id);
        $setting->update($data);
        return $setting;
    }

    public function getForRestaurant(int $restaurantId, ?int $branchId = null): ?PosSetting
    {
        $query = $this->model->where('restaurant_id', $restaurantId);

        if ($branchId) {
            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)->orWhereNull('branch_id');
            })->orderBy('branch_id', 'desc');
        } else {
            $query->whereNull('branch_id');
        }

        return $query->first();
    }

    public function getOrCreateForRestaurant(int $restaurantId, ?int $branchId = null): PosSetting
    {
        $setting = $this->getForRestaurant($restaurantId, $branchId);

        if (!$setting) {
            $setting = $this->create([
                'restaurant_id' => $restaurantId,
                'branch_id' => $branchId,
                'order_types' => PosSetting::getDefaultOrderTypes(),
                'payment_methods' => PosSetting::getDefaultPaymentMethods(),
            ]);
        }

        return $setting;
    }
}
