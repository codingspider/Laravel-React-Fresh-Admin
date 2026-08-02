<?php

namespace Modules\CustomerDisplay\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerDisplaySettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'show_payment_qr' => ['sometimes', 'boolean'],
            'show_promotions' => ['sometimes', 'boolean'],
            'refresh_interval' => ['sometimes', 'integer', 'min:5', 'max:120'],
            'active_statuses' => ['sometimes', 'array'],
            'active_statuses.*' => ['string', 'in:pending,confirmed,preparing,ready,served,cancelled'],
            'payment_qr_image' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:2048'],
        ];
    }
}
