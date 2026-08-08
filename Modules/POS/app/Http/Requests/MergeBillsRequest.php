<?php

namespace Modules\POS\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MergeBillsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'sale_ids' => 'required|array|min:2',
            'sale_ids.*' => 'required|exists:sales,id',
        ];
    }
}
