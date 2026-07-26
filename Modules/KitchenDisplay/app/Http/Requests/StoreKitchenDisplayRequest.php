<?php

namespace Modules\KitchenDisplay\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKitchenDisplayRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return ['name' => 'required|string|max:255']; }
}
