<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:100',
            'order_amount' => 'required|numeric|min:0',
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'branch_id' => 'nullable|exists:branches,id',
            'customer_id' => 'nullable|exists:users,id',
        ];
    }
}
