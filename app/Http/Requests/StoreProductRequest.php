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
            'category_id'           => 'required|exists:categories,id',
            'branch_id'             => 'required|exists:branches,id',
            'sequence_index'        => 'nullable|integer|min:0',
            'sku'                   => 'nullable|string|max:100',
            'subtitle'              => 'nullable|string|max:255',
            'description'           => 'nullable|string',

            // IMAGES
            'main_image'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            // RELATIONS
            'variations'            => 'nullable|array',
            'variations.*'          => 'integer|exists:variations,id',
            'addons'                => 'nullable|array',
            'addons.*'              => 'integer|exists:addons,id',

            // ENUM FIELDS
            'item_available_for'    => 'required|array|min:1',
            'item_available_for.*'  => 'in:dine_in,pickup,delivery',

            'featured_item'         => 'nullable|boolean',
            'is_active'             => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'Item name is required.',
            'category_id.required'  => 'Category is required.',
            'category_id.exists'    => 'Selected category is invalid.',
            'branch_id.required'    => 'Branch is required.',
            'branch_id.exists'      => 'Selected branch is invalid.',
            'is_active.required'      => 'Status is required',
            'item_available_for.*.in' => 'Invalid item availability type.',
        ];
    }
}
