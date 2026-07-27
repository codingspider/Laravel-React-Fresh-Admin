<?php

namespace Modules\Restaurant\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Restaurant\Http\Requests\StoreRestaurantRequest;
use Modules\Restaurant\Http\Requests\UpdateRestaurantRequest;
use Modules\Restaurant\Resources\RestaurantResource;
use Modules\Restaurant\Services\RestaurantService;

class RestaurantController extends Controller
{
    protected string $langKey = 'restaurant::module';

    public function __construct(protected RestaurantService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'owner_id'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => RestaurantResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreRestaurantRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;

        $restaurant = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new RestaurantResource($restaurant),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $restaurant = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    public function update(UpdateRestaurantRequest $request, $id): JsonResponse
    {
        $restaurant = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new RestaurantResource($restaurant),
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

    public function updateWorkingHours(Request $request, $id): JsonResponse
    {
        $request->validate(['working_hours' => 'required|array']);
        $restaurant = $this->service->updateWorkingHours($id, $request->input('working_hours'));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.settings_updated'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    public function updateTaxSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_name' => 'nullable|string|max:50',
            'tax_inclusive' => 'nullable|boolean',
        ]);

        $restaurant = $this->service->updateTaxSettings($id, $request->only([
            'tax_rate', 'tax_name', 'tax_inclusive',
        ]));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.tax_settings_updated'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }
}
