<?php

namespace Modules\GuestOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\GuestOrder\Services\GuestOrderService;

class GuestMenuController extends Controller
{
    public function __construct(protected GuestOrderService $service) {}

    public function table(string $token): JsonResponse
    {
        $data = $this->service->resolveTable($token);

        if (!$data) {
            return response()->json([
                'status' => 'error',
                'message' => trans('guestorder::module.table_not_found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function menu(): JsonResponse
    {
        $restaurantId = request()->query('restaurant_id');
        $branchId = request()->query('branch_id');

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('guestorder::module.restaurant_required'),
            ], 422);
        }

        $menu = $this->service->getMenu((int) $restaurantId, $branchId ? (int) $branchId : null);

        return response()->json([
            'status' => 'success',
            'data' => $menu,
        ]);
    }
}
