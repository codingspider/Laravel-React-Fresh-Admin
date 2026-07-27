<?php

namespace Modules\TableManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'table_id' => 'nullable|exists:tables,id',
            'customer_id' => 'nullable|exists:customers,id',
            'guest_name' => 'sometimes|required|string|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'guest_email' => 'nullable|email|max:255',
            'guest_count' => 'sometimes|integer|min:1',
            'reservation_date' => 'sometimes|date|after_or_equal:today',
            'reservation_time' => 'sometimes|string|max:5',
            'duration' => 'nullable|integer|min:15|max:480',
            'status' => 'sometimes|in:pending,confirmed,seated,completed,cancelled,no_show',
            'deposit_amount' => 'nullable|numeric|min:0',
            'special_requests' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:1000',
        ];
    }
}
