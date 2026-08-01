<?php

namespace Modules\POS\Repositories;

use Modules\POS\Models\Coupon;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CouponRepository
{
    protected $model;

    public function __construct(Coupon $model)
    {
        $this->model = $model;
    }

    public function getAll(array $filters = [], int $perPage = 15)
    {
        $query = $this->model->with('restaurant');

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        if (!empty($filters['search'])) {
            $query->where('code', 'like', "%{$filters['search']}%");
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function find(int $id): ?Coupon
    {
        return $this->model->with('restaurant')->find($id);
    }

    public function findByCode(string $code, ?int $restaurantId = null, ?int $branchId = null): ?Coupon
    {
        $query = $this->model->where('code', $code);

        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }
        if ($branchId) {
            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)->orWhereNull('branch_id');
            });
        }

        return $query->valid()->first();
    }

    public function validate(string $code, float $orderAmount, ?int $restaurantId = null, ?int $branchId = null, ?int $customerId = null): array
    {
        $coupon = $this->findByCode($code, $restaurantId, $branchId);

        if (!$coupon) {
            return ['valid' => false, 'message' => trans('pos::module.coupon_not_found')];
        }

        if (!$coupon->isValid()) {
            return ['valid' => false, 'message' => trans('pos::module.coupon_invalid')];
        }

        if ($orderAmount < $coupon->min_order_amount) {
            return [
                'valid' => false,
                'message' => trans('pos::module.coupon_minimum_amount', ['amount' => $coupon->min_order_amount]),
            ];
        }

        if ($coupon->per_customer_limit !== null && $customerId !== null) {
            $usedCount = DB::table('sales')
                ->where('restaurant_id', $restaurantId)
                ->where('customer_id', $customerId)
                ->where('coupon_code', $code)
                ->count();

            if ($usedCount >= $coupon->per_customer_limit) {
                return ['valid' => false, 'message' => trans('pos::module.coupon_usage_limit_reached')];
            }
        }

        $discount = $coupon->calculateDiscount($orderAmount);

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $discount,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'message' => trans('pos::module.coupon_applied', [
                'detail' => $coupon->type === 'fixed' ? number_format($discount, 2) : "{$coupon->value}% off",
            ]),
        ];
    }

    public function create(array $data): Coupon
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Coupon
    {
        $coupon = $this->find($id);
        if (!$coupon) return null;
        $coupon->update($data);
        return $coupon;
    }

    public function delete(int $id): bool
    {
        $coupon = $this->find($id);
        if (!$coupon) return false;
        return $coupon->delete();
    }

    public function count(array $filters = []): int
    {
        $query = $this->model->newQuery();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->count();
    }
}
