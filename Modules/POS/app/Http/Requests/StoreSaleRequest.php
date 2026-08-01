<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => 'nullable|exists:branches,id',
            'table_id' => 'nullable|exists:tables,id',
            'customer_id' => 'nullable|exists:customers,id',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:255',
            'items.*.modifiers' => 'nullable|array',
            'items.*.modifiers.*.id' => 'nullable|integer',
            'items.*.modifiers.*.name' => 'nullable|string|max:255',
            'items.*.modifiers.*.price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'kitchen_notes' => 'nullable|string|max:1000',
            'discount_type' => 'nullable|in:fixed,percent',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'coupon_code' => 'nullable|string|max:100',
            'shipping' => 'nullable|numeric|min:0',
            'delivery_charge' => 'nullable|numeric|min:0',
            'tip_amount' => 'nullable|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_name' => 'nullable|string|max:100',
        ];
    }
}
