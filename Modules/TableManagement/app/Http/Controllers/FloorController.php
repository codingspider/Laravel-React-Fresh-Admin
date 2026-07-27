<?php

namespace Modules\TableManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\TableManagement\Http\Requests\StoreFloorRequest;
use Modules\TableManagement\Resources\FloorResource;
use Modules\TableManagement\Services\FloorService;
use Modules\Restaurant\Models\Restaurant;

class FloorController extends Controller
{
    protected string $langKey = 'tablemanagement::module';

    public function __construct(protected FloorService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $floors = $this->service->getByRestaurant($restaurant?->id ?? $request->user()->id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => FloorResource::collection($floors),
        ]);
    }

    public function store(StoreFloorRequest $request): JsonResponse
    {
        $data = $request->validated();
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;

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

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new FloorResource($floor),
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'layout_data' => 'nullable|array',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $floor = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new FloorResource($floor),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
