<?php

namespace Modules\CustomerDisplay\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CustomerDisplay\Http\Requests\UpdateCustomerDisplaySettingRequest;
use Modules\CustomerDisplay\Services\CustomerDisplayService;

class CustomerDisplayController
{
    public function __construct(private readonly CustomerDisplayService $service)
    {
    }

    /**
     * Public board for the customer display monitor.
     *
     * No authentication required: the secondary screen is shared with all
     * customers. The restaurant is resolved from the query string (or falls
     * back to the only restaurant in the installation).
     */
    public function board(Request $request): JsonResponse
    {
        $restaurantId = $request->integer('restaurant_id') ?: null;
        $branchId = $request->integer('branch_id') ?: null;

        $data = $this->service->board($restaurantId, $branchId);

        return response()->json([
            'status' => 'success',
            'message' => trans('customersdisplay::module.board_fetched'),
            'data' => $data,
        ]);
    }

    /**
     * Show the display settings for the authenticated restaurant.
     */
    public function settings(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('view_customer_display'), 403);

        $restaurantId = $this->service->resolveRestaurantId(getRestaurantId($request->user()));

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('customersdisplay::module.restaurant_not_found'),
            ], 404);
        }

        $settings = $this->service->settings($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans('customersdisplay::module.settings_fetched'),
            'data' => [
                'settings' => [
                    'show_payment_qr' => $settings->show_payment_qr,
                    'show_promotions' => $settings->show_promotions,
                    'refresh_interval' => $settings->refresh_interval,
                    'active_statuses' => $settings->getStatusesAttribute(),
                    'payment_qr_image' => $settings->payment_qr_image
                        ? '/' . ltrim($settings->payment_qr_image, '/')
                        : null,
                ],
            ],
        ]);
    }

    /**
     * Update the display settings for the authenticated restaurant.
     */
    public function update(UpdateCustomerDisplaySettingRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('manage_customer_display'), 403);

        $restaurantId = $this->service->resolveRestaurantId(getRestaurantId($request->user()));

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('customersdisplay::module.restaurant_not_found'),
            ], 404);
        }

        $data = $request->only([
            'show_payment_qr',
            'show_promotions',
            'refresh_interval',
            'active_statuses',
        ]);

        $settings = $this->service->updateSettings(
            $restaurantId,
            $data,
            $request->file('payment_qr_image')
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('customersdisplay::module.settings_updated'),
            'data' => [
                'settings' => [
                    'show_payment_qr' => $settings->show_payment_qr,
                    'show_promotions' => $settings->show_promotions,
                    'refresh_interval' => $settings->refresh_interval,
                    'active_statuses' => $settings->getStatusesAttribute(),
                    'payment_qr_image' => $settings->payment_qr_image
                        ? '/' . ltrim($settings->payment_qr_image, '/')
                        : null,
                ],
            ],
        ]);
    }
}
