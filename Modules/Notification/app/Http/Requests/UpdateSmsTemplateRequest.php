<?php

namespace Modules\Notification\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSmsTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'channel' => ['sometimes', 'in:sms,whatsapp'],
            'body' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ];
    }
}
