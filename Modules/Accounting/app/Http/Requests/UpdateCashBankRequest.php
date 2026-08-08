<?php

namespace Modules\Accounting\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCashBankRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|required|in:cash_deposit,cash_withdraw,bank_deposit,bank_withdraw,transfer',
            'account_id' => 'sometimes|required|exists:accounts,id',
            'from_account_id' => 'nullable|exists:accounts,id',
            'to_account_id' => 'nullable|exists:accounts,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'transaction_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,cancelled',
        ];
    }
}
