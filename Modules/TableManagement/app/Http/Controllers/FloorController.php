<?php

namespace Modules\TableManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\TableManagement\Http\Requests\StoreFloorRequest;
use Modules\TableManagement\Resources\FloorResource;
use Modules\TableManagement\Services\FloorService;

class FloorController extends Controller
{
    protected string $langKey = 'tablemanagement::module';

    public function __construct(protected FloorService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();
        $floors = $this->service->getByRestaurant($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => FloorResource::collection($floors),
        ]);
    }

    public function store(StoreFloorRequest $request): JsonResponse
    {
        $data = $request->validated();

        $restaurantId = getRestaurantId();

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.restaurant_required'),
            ], 422);
        }

        $data['restaurant_id'] = $restaurantId;

        $floor = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new FloorResource($floor),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $floor = $this->service->find($id);
        if (getRestaurantId() && $floor->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new FloorResource($floor),
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $floor = $this->service->find($id);
        if (getRestaurantId() && $floor->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'layout_data' => 'nullable|array',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $floor = $this->service->update($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new FloorResource($floor),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $floor = $this->service->find($id);
        if (getRestaurantId() && $floor->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
