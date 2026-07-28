<?php

namespace Modules\Subscription\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurant_id' => 'sometimes|required|exists:restaurants,id',
            'plan_id' => 'sometimes|required|exists:plans,id',
            'starts_at' => 'sometimes|required|date',
            'ends_at' => 'sometimes|required|date|after:starts_at',
            'trial_ends_at' => 'nullable|date',
            'cancelled_at' => 'nullable|date',
            'payment_status' => 'sometimes|required|in:pending,paid,failed,refunded',
            'payment_method' => 'sometimes|required|in:offline,online,bank_transfer,cash',
            'payment_amount' => 'sometimes|required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,expired,cancelled',
        ];
    }
}
