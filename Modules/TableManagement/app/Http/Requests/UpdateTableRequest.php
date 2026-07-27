<?php

namespace Modules\TableManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTableRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'floor_id' => 'nullable|exists:floors,id',
            'name' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|integer|min:1|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:available,reserved,occupied,billing,cleaning,maintenance',
            'position' => 'nullable|array',
            'position.x' => 'nullable|numeric',
            'position.y' => 'nullable|numeric',
            'metadata' => 'nullable|array',
        ];
    }
}
