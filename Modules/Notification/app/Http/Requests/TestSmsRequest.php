<?php

namespace Modules\Notification\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TestSmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'channel' => ['required', 'in:sms,whatsapp'],
            'to' => ['required', 'string'],
            'body' => ['required', 'string'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ];
    }
}
