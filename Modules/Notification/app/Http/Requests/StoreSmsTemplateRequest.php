<?php

namespace Modules\Notification\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSmsTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'channel' => ['required', 'in:sms,whatsapp'],
            'body' => ['required', 'string'],
            'is_active' => ['boolean'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ];
    }
}
