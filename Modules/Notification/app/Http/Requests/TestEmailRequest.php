<?php

namespace Modules\Notification\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TestEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to' => ['required', 'email'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ];
    }
}
