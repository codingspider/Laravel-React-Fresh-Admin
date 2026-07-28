<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                  => 'required|string|max:255',
            'category_id'           => 'nullable|exists:menu_categories,id',
            'branch_id'             => 'nullable|exists:branches,id',
            'sku'                   => 'nullable|string|max:100',
            'subtitle'              => 'nullable|string|max:255',
            'description'           => 'nullable|string',
            'product_cost'          => 'nullable|numeric|min:0',
            'sell_price'            => 'required|numeric|min:0',
            'image'                 => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'item_available_for'    => 'nullable|array',
            'item_available_for.*'  => 'in:dine_in,pickup,delivery',
            'featured_item'         => 'nullable|boolean',
            'is_active'             => 'required|boolean',
            'sort_order'            => 'nullable|integer|min:0',
        ];
    }
}
