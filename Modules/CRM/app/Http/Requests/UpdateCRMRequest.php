<?php

namespace Modules\CRM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCRMRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return ['name' => 'sometimes|string|max:255']; }
}
