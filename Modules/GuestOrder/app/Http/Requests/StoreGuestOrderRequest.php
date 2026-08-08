<?php

namespace Modules\GuestOrder\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuestOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'table_id' => 'nullable|integer|exists:tables,id',
            'guest_name' => 'nullable|string|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer|exists:menu_items,id',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.modifiers' => 'nullable|array',
            'items.*.modifiers.*.id' => 'required_with:items.*.modifiers|integer',
            'items.*.modifiers.*.name' => 'required_with:items.*.modifiers|string',
            'items.*.modifiers.*.price' => 'required_with:items.*.modifiers|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
