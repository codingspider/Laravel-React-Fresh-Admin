<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePosSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => 'nullable|exists:branches,id',
            'order_types' => 'nullable|array',
            'order_types.*.value' => 'required|string',
            'order_types.*.label' => 'required|string',
            'order_types.*.enabled' => 'required|boolean',
            'payment_methods' => 'nullable|array',
            'payment_methods.*.value' => 'required|string',
            'payment_methods.*.label' => 'required|string',
            'payment_methods.*.enabled' => 'required|boolean',
            'default_tax_rate' => 'nullable|numeric|min:0|max:100',
            'default_tax_name' => 'nullable|string|max:100',
            'enable_discount' => 'nullable|boolean',
            'enable_coupon' => 'nullable|boolean',
            'enable_shipping' => 'nullable|boolean',
            'enable_tip' => 'nullable|boolean',
            'enable_notes' => 'nullable|boolean',
            'enable_kitchen_notes' => 'nullable|boolean',
            'enable_table_management' => 'nullable|boolean',
            'enable_customer' => 'nullable|boolean',
        ];
    }
}
