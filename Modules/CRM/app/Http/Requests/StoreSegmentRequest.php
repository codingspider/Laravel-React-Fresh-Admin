<?php

namespace Modules\CRM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSegmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:1000',
            'is_dynamic' => 'nullable|boolean',
            'rules' => 'nullable|array',
            'customer_ids' => 'nullable|array',
            'customer_ids.*' => 'integer|exists:customers,id',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ];
    }
}
