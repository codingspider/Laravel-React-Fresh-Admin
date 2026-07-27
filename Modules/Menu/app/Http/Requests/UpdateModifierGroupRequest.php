<?php

namespace Modules\Menu\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModifierGroupRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'is_required' => 'nullable|boolean',
            'min_selections' => 'nullable|integer|min:0',
            'max_selections' => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:active,inactive',
            'modifiers' => 'nullable|array',
            'modifiers.*.id' => 'nullable|integer',
            'modifiers.*.name' => 'required|string|max:255',
            'modifiers.*.price' => 'nullable|numeric|min:0',
            'modifiers.*.is_default' => 'nullable|boolean',
            'modifiers.*.sort_order' => 'nullable|integer|min:0',
        ];
    }
}
