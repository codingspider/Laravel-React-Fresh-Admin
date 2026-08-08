<?php

namespace Modules\Accounting\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'account_id' => 'nullable|exists:accounts,id',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
