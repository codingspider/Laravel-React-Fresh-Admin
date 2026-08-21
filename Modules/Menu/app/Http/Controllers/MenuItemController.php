<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Menu\Http\Requests\AssignBranchRequest;
use Modules\Menu\Http\Requests\StoreMenuItemRequest;
use Modules\Menu\Http\Requests\UpdateMenuItemRequest;
use Modules\Menu\Resources\MenuItemResource;
use Modules\Menu\Services\MenuItemService;

class MenuItemController extends Controller
{
    protected string $langKey = 'menu::module';

    public function __construct(protected MenuItemService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'category_id', 'is_featured', 'branch_id']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
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
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

        if ($request->hasFile('image')) {
            $data['image'] = uploadImage($request->file('image'), 'menu-items');
        } else {
            unset($data['image']);
        }

        $item = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new MenuItemResource($item),
        ], 201);
    }

    public function assignBranch(AssignBranchRequest $request): JsonResponse
    {
        $data = $request->validated();

        $count = $this->service->assignToBranch(
            $data['item_ids'],
            (int) $data['branch_id']
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('menu::module.branch_assigned', ['count' => $count]),
            'data' => ['count' => $count],
        ]);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new MenuItemResource($item),
        ]);
    }

    public function update(UpdateMenuItemRequest $request, $id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = uploadImage($request->file('image'), 'menu-items', $item->image);
        } else {
            unset($data['image']);
        }

        $item = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new MenuItemResource($item),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
