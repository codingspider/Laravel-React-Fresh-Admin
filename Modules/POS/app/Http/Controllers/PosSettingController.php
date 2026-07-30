<?php

namespace Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\POS\Http\Requests\UpdatePosSettingRequest;
use Modules\POS\Resources\PosSettingResource;
use Modules\POS\Services\PosSettingService;

class PosSettingController extends Controller
{
    protected string $langKey = 'pos::module';

    public function __construct(protected PosSettingService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();
        $branchId = $request->input('branch_id');

        $setting = $this->service->getForRestaurant($restaurantId, $branchId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new PosSettingResource($setting),
        ]);
    }

    public function update(UpdatePosSettingRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId();
        $branchId = $request->input('branch_id');

        $setting = $this->service->update($restaurantId, $request->validated(), $branchId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new PosSettingResource($setting),
        ]);
    }
}
