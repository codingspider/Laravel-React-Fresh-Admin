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
use Carbon\Carbon;
use Modules\Branch\Models\Branch;
use Modules\Restaurant\Models\Restaurant;

class CouponController extends Controller
{
    protected $service;

    public function __construct(CouponService $service)
    {
        $this->service = $service;
    }

    /**
     * Resolve the effective timezone for the coupon and convert the wall-clock
     * start/expiry datetimes into UTC instants before persisting. Each branch
     * (and fallback restaurant) can define its own timezone.
     */
    protected function normalizeDates(array $data, Request $request): array
    {
        $timezone = $data['timezone'] ?? $request->input('timezone');

        if (!$timezone) {
            $branchId = $data['branch_id'] ?? null;
            $timezone = $branchId ? Branch::find($branchId)?->timezone : null;
        }

        if (!$timezone) {
            $restaurantId = $data['restaurant_id'] ?? null;
            $timezone = $restaurantId ? Restaurant::find($restaurantId)?->timezone : null;
        }

        $timezone = $timezone ?: config('app.timezone');
        unset($data['timezone']);

        if (in_array($timezone, timezone_identifiers_list(), true)) {
            foreach (['starts_at', 'expires_at'] as $field) {
                if (!empty($data[$field])) {
                    $data[$field] = Carbon::parse($data[$field], $timezone)->utc();
                }
            }
        }

        return $data;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'restaurant_id' => $request->user()?->restaurant_id,
            'branch_id' => $request->filled('branch_id') ? $request->input('branch_id') : $request->user()?->branch_id,
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

        $data = $this->normalizeDates($data, $request);

        $coupon = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('pos::module.created'),
            'data' => new CouponResource($coupon),
        ], 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $this->authorizeCoupon($coupon);

        return response()->json([
            'status' => 'success',
            'data' => new CouponResource($coupon),
        ]);
    }

    public function update(StoreCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorizeCoupon($coupon);
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

        $data = $this->normalizeDates($data, $request);

        $coupon = $this->service->update($coupon->id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('pos::module.updated'),
            'data' => new CouponResource($coupon),
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $this->authorizeCoupon($coupon);
        $this->service->delete($coupon->id);

        return response()->json([
            'status' => 'success',
            'message' => trans('pos::module.deleted'),
        ]);
    }

    protected function authorizeCoupon(Coupon $coupon): void
    {
        if (getRestaurantId() && $coupon->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }
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
