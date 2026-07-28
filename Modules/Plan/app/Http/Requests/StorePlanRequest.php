<?php

namespace Modules\Plan\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:plans,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'branch_limit' => 'required|integer|min:1',
            'user_limit' => 'required|integer|min:1',
            'invoice_limit' => 'required|integer|min:1',
            'package_ids' => 'required|array',
            'package_ids.*' => 'exists:packages,id',
            'is_active' => 'nullable|in:0,1,true,false',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
