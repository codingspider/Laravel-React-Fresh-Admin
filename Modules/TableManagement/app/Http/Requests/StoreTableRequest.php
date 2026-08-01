<?php

namespace Modules\TableManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTableRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'floor_id' => 'required|exists:floors,id',
            'capacity' => 'required|integer|min:1|max:100',
            'status' => 'nullable|in:available,reserved,occupied,billing,cleaning,maintenance',
            'sort_order' => 'nullable|integer|min:0',
            'position' => 'nullable|array',
            'position.x' => 'nullable|numeric',
            'position.y' => 'nullable|numeric',
            'metadata' => 'nullable|array',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ];
    }
}
