<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Services\ExpenseService;

class ExpenseController extends Controller
{
    protected string $langKey = 'accounting::module';

    public function __construct(protected ExpenseService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'date_from', 'date_to']);
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

    public function store(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $data = $request->validate([
            'accounting_expense_category_id' => 'nullable|exists:accounting_expense_categories,id',
            'account_id' => 'nullable|exists:accounts,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'branch_id' => 'nullable|exists:branches,id',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

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

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $expense,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'accounting_expense_category_id' => 'nullable|exists:accounting_expense_categories,id',
            'account_id' => 'nullable|exists:accounts,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'branch_id' => 'nullable|exists:branches,id',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'amount' => 'sometimes|required|numeric|min:0',
            'expense_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $expense = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $expense,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
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
