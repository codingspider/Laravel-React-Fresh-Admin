<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Menu\Http\Requests\StoreMenuItemRequest;
use Modules\Menu\Http\Requests\UpdateMenuItemRequest;
use Modules\Menu\Resources\MenuItemResource;
use Modules\Menu\Services\MenuItemService;
use Modules\Restaurant\Models\Restaurant;

class MenuItemController extends Controller
{
    protected string $langKey = 'menu::module';

    public function __construct(protected MenuItemService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'restaurant_id', 'category_id', 'is_featured', 'is_vegetarian'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => MenuItemResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;

        $item = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new MenuItemResource($item),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new MenuItemResource($item),
        ]);
    }

    public function update(UpdateMenuItemRequest $request, $id): JsonResponse
    {
        $item = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new MenuItemResource($item),
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
