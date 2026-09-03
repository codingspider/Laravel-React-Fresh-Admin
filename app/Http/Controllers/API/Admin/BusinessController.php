<?php

namespace App\Http\Controllers\API\Admin;

use Modules\Restaurant\Models\Restaurant;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\API\BaseController;
use App\Http\Requests\InvoiceSettingRequest;
use App\Http\Requests\UpdateBusinessRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Http\Requests\NotificationSettingRequest;
use Illuminate\Support\Facades\Log;

class BusinessController extends BaseController
{
    /**
     * Return the authenticated user's restaurant (business) record.
     */
    public function index(Request $request)
    {
        try {
            $restaurant = $this->currentRestaurant();

            if (!$restaurant) {
                return $this->sendError('Restaurant not found.');
            }

            return $this->sendResponse($restaurant, 'Restaurant retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Restaurant fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve restaurant.', [], 500);
        }
    }

    /**
     * Update the restaurant general information (name, contact, address, logo).
     */
    public function update(UpdateBusinessRequest $request, $id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            $data = $request->validated();

            // Upload restaurant logo
            if ($request->hasFile('logo')) {
                $data['logo'] = uploadImage(
                    $request->file('logo'),
                    'uploads/restaurant/logo',
                    $restaurant->logo
                );
            }

            $restaurant->update($data);

            return $this->sendResponse($restaurant, 'Restaurant updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Restaurant update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update restaurant.', [], 500);
        }
    }

    /**
     * Update the restaurant currency and its symbol based on the selected code.
     */
    public function updateCurrency(UpdateCurrencyRequest $request)
    {
        try {
            $restaurant = $this->currentRestaurant();

            if (!$restaurant) {
                return $this->sendError('Restaurant not found.');
            }

            $currency = \Modules\Currency\Models\Currency::where('code', $request->currency_code)->first();

            $restaurant->update([
                'currency' => $currency?->code ?? $request->currency_code,
                'currency_symbol' => $currency?->symbol ?? $restaurant->currency_symbol,
            ]);

            return $this->sendResponse($restaurant, 'Currency updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Currency update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update currency.', [], 500);
        }
    }

    /**
     * Return the invoice / receipt settings for the current restaurant.
     */
    public function getInvoiceSetting(Request $request)
    {
        try {
            $restaurant = $this->currentRestaurant();

            if (!$restaurant) {
                return $this->sendError('Restaurant not found.');
            }

            return $this->sendResponse($restaurant->invoiceSettings(), 'Invoice setting retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Invoice setting fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve invoice settings.', [], 500);
        }
    }

    /**
     * Save the invoice / receipt settings for the current restaurant.
     */
    public function updateInvoiceSetting(InvoiceSettingRequest $request)
    {
        try {
            $restaurant = $this->currentRestaurant();

            if (!$restaurant) {
                return $this->sendError('Restaurant not found.');
            }

            $settings = $restaurant->receipt_settings ?: [];

            foreach ($request->validated() as $key => $value) {
                $settings[$key] = $value;
            }

            // Handle invoice logo upload
            if ($request->hasFile('logo')) {
                $settings['logo'] = uploadImage(
                    $request->file('logo'),
                    'uploads/restaurant/invoice',
                    $settings['logo'] ?? null
                );
            }

            $restaurant->receipt_settings = $settings;
            $restaurant->save();

            return $this->sendResponse($restaurant->receipt_settings, 'Invoice setting saved successfully.');
        } catch (\Exception $e) {
            \Log::error('Invoice setting update failed: ' . $e->getMessage());
            return $this->sendError('Failed to save invoice settings.', [], 500);
        }
    }

    /**
     * Return the notification settings for the current restaurant.
     */
    public function getNotificationSetting(Request $request)
    {
        try {
            $restaurant = $this->currentRestaurant();

            if (!$restaurant) {
                return $this->sendError('Restaurant not found.');
            }

            return $this->sendResponse($restaurant->notification_settings ?: [], 'Notification setting retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Notification setting fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve notification settings.', [], 500);
        }
    }

    /**
     * Save the notification settings for the current restaurant.
     */
    public function updateNotification(NotificationSettingRequest $request)
    {
        try {
            $restaurant = $this->currentRestaurant();

            if (!$restaurant) {
                return $this->sendError('Restaurant not found.');
            }

            $settings = $restaurant->notification_settings ?: [];
            $settings[$request->type] = $request->settings;
            $settings[$request->type . '_is_active'] = $request->boolean('is_active');

            $restaurant->notification_settings = $settings;
            $restaurant->save();

            return $this->sendResponse($settings, 'Notification setting saved successfully.');
        } catch (\Exception $e) {
            \Log::error('Notification setting update failed: ' . $e->getMessage());
            return $this->sendError('Failed to save notification settings.', [], 500);
        }
    }

    /**
     * Resolve the restaurant record for the authenticated user.
     */
    private function currentRestaurant(): ?Restaurant
    {
        $user = auth()->user();

        if (!$user) {
            return null;
        }

        $restaurantId = getRestaurantId($user);

        return $restaurantId ? Restaurant::find($restaurantId) : null;
    }
}
