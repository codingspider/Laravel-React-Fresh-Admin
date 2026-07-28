<?php

namespace Modules\Currency\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCurrencyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:10|unique:currencies,code,' . $this->route('currency'),
            'symbol' => 'sometimes|required|string|max:10',
            'symbol_first' => 'nullable|boolean',
            'decimal_mark' => 'nullable|string|max:1',
            'thousands_separator' => 'nullable|string|max:1',
            'precision' => 'nullable|integer|min:0|max:4',
            'is_active' => 'nullable|boolean',
        ];
    }
}
