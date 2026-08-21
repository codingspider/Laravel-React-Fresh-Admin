<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Menu\Http\Requests\StoreModifierGroupRequest;
use Modules\Menu\Http\Requests\UpdateModifierGroupRequest;
use Modules\Menu\Resources\ModifierGroupResource;
use Modules\Menu\Services\ModifierGroupService;

class ModifierGroupController extends Controller
{
    protected string $langKey = 'menu::module';

    public function __construct(protected ModifierGroupService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'branch_id']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
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
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

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
        if (getRestaurantId() && $group->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new ModifierGroupResource($group),
        ]);
    }

    public function update(UpdateModifierGroupRequest $request, $id): JsonResponse
    {
        $group = $this->service->find($id);
        if (getRestaurantId() && $group->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $group = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new ModifierGroupResource($group),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $group = $this->service->find($id);
        if (getRestaurantId() && $group->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
