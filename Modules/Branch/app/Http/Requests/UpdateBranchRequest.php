<?php

namespace Modules\Branch\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255',
            'is_main' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'latitude' => 'nullable|string|max:20',
            'longitude' => 'nullable|string|max:20',
            'timezone' => 'nullable|string|max:50',
            'working_hours' => 'nullable|array',
            'holidays' => 'nullable|array',
            'settings' => 'nullable|array',
            'status' => 'sometimes|in:active,inactive',
        ];
    }
}
