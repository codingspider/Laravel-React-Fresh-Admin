<?php

namespace Modules\Subscription\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurant_id' => 'required|exists:restaurants,id',
            'plan_id' => 'required|exists:plans,id',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'trial_ends_at' => 'nullable|date',
            'cancelled_at' => 'nullable|date',
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'payment_method' => 'required|in:offline,online,bank_transfer,cash',
            'payment_amount' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,expired,cancelled',
        ];
    }
}
