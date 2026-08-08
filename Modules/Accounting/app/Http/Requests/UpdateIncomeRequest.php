<?php

namespace Modules\Accounting\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIncomeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'account_id' => 'nullable|exists:accounts,id',
            'branch_id' => 'nullable|exists:branches,id',
            'source' => 'sometimes|required|in:pos_sale,manual_income,other_income',
            'category' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'amount' => 'sometimes|required|numeric|min:0',
            'income_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
