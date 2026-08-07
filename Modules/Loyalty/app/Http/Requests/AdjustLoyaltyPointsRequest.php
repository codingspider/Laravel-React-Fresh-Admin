<?php

namespace Modules\Loyalty\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustLoyaltyPointsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|integer|exists:customers,id',
            'points' => 'required|integer|not_in:0',
            'reason' => 'required|string|max:500',
        ];
    }
}
