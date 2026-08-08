<?php

namespace Modules\CRM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFollowUpRequest extends FormRequest
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
            'customer_id' => 'sometimes|required|integer|exists:customers,id',
            'title' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'due_at' => 'nullable|date',
            'status' => 'nullable|string|in:pending,completed',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ];
    }
}
