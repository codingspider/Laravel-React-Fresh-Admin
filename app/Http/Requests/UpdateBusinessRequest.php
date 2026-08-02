<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|max:50',
            'email'    => 'nullable|email|max:255',
            'address'  => 'nullable|string|max:500',
            'city'     => 'nullable|string|max:255',
            'state'    => 'nullable|string|max:255',
            'country'  => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:20',
            'timezone' => 'nullable|string|max:100',

            // File validations
            'logo'     => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }
}
