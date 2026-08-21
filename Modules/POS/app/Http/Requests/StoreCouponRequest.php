<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id;
        $restaurantId = $this->restaurant_id ?? getRestaurantId();

        return [
            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('coupons', 'code')
                    ->where(fn ($q) => $restaurantId
                        ? $q->where('restaurant_id', $restaurantId)
                        : $q->whereNull('restaurant_id'))
                    ->ignore($couponId),
            ],
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_customer_limit' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'timezone' => 'nullable|string|max:50',
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'branch_id' => 'nullable|exists:branches,id',
        ];
    }
}
