<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Menu\Http\Requests\StoreModifierGroupRequest;
use Modules\Menu\Http\Requests\UpdateModifierGroupRequest;
use Modules\Menu\Resources\ModifierGroupResource;
use Modules\Menu\Services\ModifierGroupService;
use Modules\Restaurant\Models\Restaurant;

class ModifierGroupController extends Controller
{
    protected string $langKey = 'menu::module';

    public function __construct(protected ModifierGroupService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'restaurant_id'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => ModifierGroupResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreModifierGroupRequest $request): JsonResponse
    {
        $data = $request->validated();
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;

        $group = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new ModifierGroupResource($group),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $group = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new ModifierGroupResource($group),
        ]);
    }

    public function update(UpdateModifierGroupRequest $request, $id): JsonResponse
    {
        $group = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new ModifierGroupResource($group),
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
