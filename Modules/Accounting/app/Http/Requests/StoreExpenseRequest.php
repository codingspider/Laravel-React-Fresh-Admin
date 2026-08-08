<?php

namespace Modules\Accounting\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'accounting_expense_category_id' => 'nullable|exists:accounting_expense_categories,id',
            'account_id' => 'nullable|exists:accounts,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'branch_id' => 'nullable|exists:branches,id',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,approved,rejected',
        ];
    }
}
