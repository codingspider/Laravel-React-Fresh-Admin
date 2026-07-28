<?php

namespace Modules\Package\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:packages,slug,' . $this->route('package'),
            'description' => 'nullable|string',
            'modules' => 'sometimes|required|array',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
