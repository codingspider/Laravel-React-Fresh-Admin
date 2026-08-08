<?php

namespace Modules\Accounting\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalEntryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'account_id' => 'nullable|exists:accounts,id',
            'entry_type' => 'nullable|in:debit,credit',
            'amount' => 'nullable|numeric|min:0',
            'entry_date' => 'nullable|date',
            'reference_number' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'source_module' => 'nullable|string|max:50',
            'reference_id' => 'nullable|string|max:255',
            'entries' => 'nullable|array',
            'entries.*.account_id' => 'required|exists:accounts,id',
            'entries.*.entry_type' => 'required|in:debit,credit',
            'entries.*.amount' => 'required|numeric|min:0',
            'entries.*.description' => 'nullable|string',
        ];
    }
}
