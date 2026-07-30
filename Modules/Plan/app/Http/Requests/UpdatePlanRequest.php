<?php

namespace Modules\Plan\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:plans,slug,' . $this->route('plan'),
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'billing_cycle' => 'sometimes|required|in:monthly,yearly',
            'branch_limit' => 'sometimes|required|integer|min:1',
            'user_limit' => 'sometimes|required|integer|min:1',
            'invoice_limit' => 'sometimes|required|integer|min:1',
            'trial_days' => 'nullable|integer|min:0|max:365',
            'package_ids' => 'sometimes|required|array',
            'package_ids.*' => 'exists:packages,id',
            'is_active' => 'nullable|in:0,1,true,false',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
