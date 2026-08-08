<?php

namespace Modules\TableManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvailableTablesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'branch_id' => 'required|exists:branches,id',
            'guest_count' => 'nullable|integer|min:1',
        ];
    }
}
