<?php

namespace Modules\Menu\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|max:2048',
            'parent_id' => 'nullable|exists:menu_categories,id',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:active,inactive',
            'metadata' => 'nullable|array',
        ];
    }
}
