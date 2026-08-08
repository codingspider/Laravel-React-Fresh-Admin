<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessRefundRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,upi,online,credit,loyalty,gift_card,other',
            'refund_reason' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
