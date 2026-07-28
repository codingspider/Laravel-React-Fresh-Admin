<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Menu\Http\Requests\StoreMenuCategoryRequest;
use Modules\Menu\Http\Requests\UpdateMenuCategoryRequest;
use Modules\Menu\Resources\MenuCategoryResource;
use Modules\Menu\Services\MenuCategoryService;

class MenuCategoryController extends Controller
{
    protected string $langKey = 'menu::module';

    public function __construct(protected MenuCategoryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
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
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

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
        if (getRestaurantId() && $category->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new MenuCategoryResource($category),
        ]);
    }

    public function update(UpdateMenuCategoryRequest $request, $id): JsonResponse
    {
        $category = $this->service->find($id);
        if (getRestaurantId() && $category->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $category = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new MenuCategoryResource($category),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $category = $this->service->find($id);
        if (getRestaurantId() && $category->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function tree(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();
        $tree = $this->service->getTree($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => MenuCategoryResource::collection($tree),
        ]);
    }
}
