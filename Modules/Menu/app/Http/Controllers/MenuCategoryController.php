<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Menu\Http\Requests\StoreMenuCategoryRequest;
use Modules\Menu\Http\Requests\UpdateMenuCategoryRequest;
use Modules\Menu\Resources\MenuCategoryResource;
use Modules\Menu\Services\MenuCategoryService;
use Modules\Restaurant\Models\Restaurant;

class MenuCategoryController extends Controller
{
    protected string $langKey = 'menu::module';

    public function __construct(protected MenuCategoryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'restaurant_id'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => MenuCategoryResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreMenuCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;

        $category = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new MenuCategoryResource($category),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $category = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new MenuCategoryResource($category),
        ]);
    }

    public function update(UpdateMenuCategoryRequest $request, $id): JsonResponse
    {
        $category = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new MenuCategoryResource($category),
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

    public function tree(Request $request): JsonResponse
    {
        $restaurantId = $request->input('restaurant_id');
        $tree = $this->service->getTree($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => MenuCategoryResource::collection($tree),
        ]);
    }
}
