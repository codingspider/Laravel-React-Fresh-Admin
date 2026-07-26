<?php

namespace Modules\KitchenDisplay\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKitchenDisplayRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return ['name' => 'sometimes|string|max:255']; }
}
