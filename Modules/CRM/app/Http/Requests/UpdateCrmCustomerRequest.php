<?php

namespace Modules\CRM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCrmCustomerRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'dob' => 'nullable|date',
            'anniversary' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'favourite_food' => 'nullable|string|max:255',
            'source' => 'nullable|string|in:manual,pos,web,qr,reservation,delivery',
            'lead_status' => 'nullable|string|in:new,contacted,qualified,won,lost',
            'is_active' => 'nullable|boolean',
            'segment_ids' => 'nullable|array',
            'segment_ids.*' => 'integer|exists:crm_segments,id',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ];
    }
}
