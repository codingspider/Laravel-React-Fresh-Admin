<?php

namespace Modules\TableManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFloorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'description' => 'nullable|string|max:500',
            'layout_data' => 'nullable|array',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ];
    }
}
