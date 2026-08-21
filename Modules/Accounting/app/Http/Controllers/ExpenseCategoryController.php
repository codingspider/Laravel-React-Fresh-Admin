<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Http\Controllers\Concerns\AuthorizesRestaurant;
use Modules\Accounting\Http\Requests\StoreExpenseCategoryRequest;
use Modules\Accounting\Http\Requests\UpdateExpenseCategoryRequest;
use Modules\Accounting\Models\ExpenseCategory;
use Modules\Accounting\Services\ExpenseCategoryService;

class ExpenseCategoryController extends Controller
{
    use AuthorizesRestaurant;

    protected string $langKey = 'accounting::module';

    public function __construct(protected ExpenseCategoryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'branch_id']);
        $filters['restaurant_id'] = getRestaurantId($request->user());

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreExpenseCategoryRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $data = $request->validated();

        $data['restaurant_id'] = $restaurantId;

        $category = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $category,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $category = $this->service->find($id);

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.not_found'),
            ], 404);
        }

        $this->authorizeOwned($request, $category->restaurant_id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $category,
        ]);
    }

    public function update(UpdateExpenseCategoryRequest $request, int $id): JsonResponse
    {
        $existing = ExpenseCategory::findOrFail($id);
        $this->authorizeOwned($request, $existing->restaurant_id);

        $data = $request->validated();

        $category = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $category,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $existing = ExpenseCategory::findOrFail($id);
        $this->authorizeOwned($request, $existing->restaurant_id);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
