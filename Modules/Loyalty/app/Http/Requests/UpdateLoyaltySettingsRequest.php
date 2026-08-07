<?php

namespace Modules\Loyalty\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLoyaltySettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive',
            'points_per_order' => 'required|integer|min:0',
            'currency_per_point' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'min_points_required' => 'required|integer|min:0',
            'max_redeem_percent' => 'nullable|numeric|min:0|max:100',
            'points_expiry_days' => 'nullable|integer|min:1',
            'enable_earning' => 'boolean',
            'enable_redemption' => 'boolean',
        ];
    }
}
