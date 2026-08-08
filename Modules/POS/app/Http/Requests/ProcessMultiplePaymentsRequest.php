<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessMultiplePaymentsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'payments' => 'required|array|min:1',
            'payments.*.payment_method' => 'required|in:cash,card,upi,online,credit,loyalty,gift_card,other',
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.reference_number' => 'nullable|string|max:255',
            'payments.*.notes' => 'nullable|string|max:255',
        ];
    }
}
