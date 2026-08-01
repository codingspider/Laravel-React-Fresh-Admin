<?php

namespace Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\POS\Services\CouponService;
use Modules\POS\Http\Requests\StoreCouponRequest;
use Modules\POS\Http\Requests\ValidateCouponRequest;
use Modules\POS\Resources\CouponResource;
use Modules\POS\Models\Coupon;

class CouponController extends Controller
{
    protected $service;

    public function __construct(CouponService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'restaurant_id' => $request->user()?->restaurant_id,
            'branch_id' => $request->user()?->branch_id,
            'is_active' => $request->boolean('is_active'),
            'search' => $request->input('search'),
        ]);

        $coupons = $this->service->getAll($filters, $request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => CouponResource::collection($coupons),
            'meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page' => $coupons->lastPage(),
                'per_page' => $coupons->perPage(),
                'total' => $coupons->total(),
            ],
        ]);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $data = $request->validated();

        $restaurantId = $data['restaurant_id'] ?? $request->input('restaurant_id') ?? getRestaurantId();
        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('pos::module.restaurant_required'),
            ], 422);
        }

        $data['restaurant_id'] = $restaurantId;
        $data['used_count'] = 0;

        $coupon = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('pos::module.created'),
            'data' => new CouponResource($coupon),
        ], 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new CouponResource($coupon),
        ]);
    }

    public function update(StoreCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['restaurant_id'])) {
            $data['restaurant_id'] = $coupon->restaurant_id ?? $request->input('restaurant_id') ?? getRestaurantId();
        }

        if (!$data['restaurant_id']) {
            return response()->json([
                'status' => 'error',
                'message' => trans('pos::module.restaurant_required'),
            ], 422);
        }

        $coupon = $this->service->update($coupon->id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('pos::module.updated'),
            'data' => new CouponResource($coupon),
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $this->service->delete($coupon->id);

        return response()->json([
            'status' => 'success',
            'message' => trans('pos::module.deleted'),
        ]);
    }

    public function validateCoupon(ValidateCouponRequest $request): JsonResponse
    {
        $result = $this->service->validate(
            $request->input('code'),
            $request->input('order_amount'),
            $request->input('restaurant_id') ?? $request->user()?->restaurant_id,
            $request->input('branch_id') ?? $request->user()?->branch_id,
            $request->input('customer_id'),
        );

        if ($result['valid']) {
            unset($result['coupon']);
        }

        return response()->json([
            'status' => $result['valid'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result,
        ], $result['valid'] ? 200 : 422);
    }
}
