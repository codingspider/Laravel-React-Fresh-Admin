<?php

namespace Modules\Loyalty\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Loyalty\Http\Requests\AdjustLoyaltyPointsRequest;
use Modules\Loyalty\Http\Requests\CustomerPointsRequest;
use Modules\Loyalty\Http\Requests\RedeemPreviewRequest;
use Modules\Loyalty\Http\Requests\UpdateLoyaltySettingsRequest;
use Modules\Loyalty\Services\LoyaltyService;

class LoyaltyController extends Controller
{
    protected string $langKey = 'loyalty::module';

    public function __construct(protected LoyaltyService $service) {}

    public function settings(Request $request): JsonResponse
    {
        $data = $this->service->settings((int) getRestaurantId());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $data,
        ]);
    }

    public function updateSettings(UpdateLoyaltySettingsRequest $request): JsonResponse
    {
        $programme = $this->service->updateSettings((int) getRestaurantId(), $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $programme,
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $data = $this->service->customers(
            (int) getRestaurantId(),
            $request->only(['search', 'branch_id']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $data,
        ]);
    }

    public function points(CustomerPointsRequest $request): JsonResponse
    {
        $data = $this->service->points((int) getRestaurantId(), (int) $request->input('customer_id'));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $data,
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $data = $this->service->transactions(
            (int) getRestaurantId(),
            $request->only(['customer_id', 'type', 'date_from', 'date_to', 'branch_id']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $data,
        ]);
    }

    public function adjust(AdjustLoyaltyPointsRequest $request): JsonResponse
    {
        $balance = $this->service->adjustPoints(
            (int) getRestaurantId(),
            (int) $request->input('customer_id'),
            (int) $request->input('points'),
            (string) $request->input('reason')
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.points_added'),
            'data' => $balance,
        ]);
    }

    public function redeemPreview(RedeemPreviewRequest $request): JsonResponse
    {
        $data = $this->service->previewRedeem(
            (int) getRestaurantId(),
            (int) $request->input('customer_id'),
            (float) $request->input('order_total')
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $data,
        ]);
    }
}
