<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Http\Controllers\Concerns\AuthorizesRestaurant;
use Modules\Accounting\Http\Requests\StoreExpenseRequest;
use Modules\Accounting\Http\Requests\UpdateExpenseRequest;
use Modules\Accounting\Models\Expense;
use Modules\Accounting\Services\ExpenseService;

class ExpenseController extends Controller
{
    use AuthorizesRestaurant;

    protected string $langKey = 'accounting::module';

    public function __construct(protected ExpenseService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'date_from', 'date_to', 'branch_id']);
        $filters['restaurant_id'] = $restaurantId;

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

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $data = $request->validated();

        $this->authorizeAccounts($request, $data['account_id'] ?? null);

        $data['restaurant_id'] = $restaurantId;

        $expense = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $expense,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $expense = $this->service->find($id);

        if (!$expense) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.not_found'),
            ], 404);
        }

        $this->authorizeOwned($request, $expense->restaurant_id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $expense,
        ]);
    }

    public function update(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        $existing = Expense::findOrFail($id);
        $this->authorizeOwned($request, $existing->restaurant_id);

        $data = $request->validated();

        $this->authorizeAccounts($request, $data['account_id'] ?? null);

        $expense = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $expense,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $existing = Expense::findOrFail($id);
        $this->authorizeOwned($request, $existing->restaurant_id);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['date_from', 'date_to']);
        $filters['restaurant_id'] = $restaurantId;

        $summary = $this->service->summary($filters);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $summary,
        ]);
    }
}
