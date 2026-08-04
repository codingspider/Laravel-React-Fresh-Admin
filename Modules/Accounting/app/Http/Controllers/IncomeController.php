<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Services\IncomeService;

class IncomeController extends Controller
{
    protected string $langKey = 'accounting::module';

    public function __construct(protected IncomeService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'source', 'date_from', 'date_to']);
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
            'account_id' => 'nullable|exists:accounts,id',
            'branch_id' => 'nullable|exists:branches,id',
            'source' => 'required|in:pos_sale,manual_income,other_income',
            'category' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:0',
            'income_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $data['restaurant_id'] = $restaurantId;

        $income = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $income,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $income = $this->service->find($id);

        if (!$income) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.not_found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $income,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'account_id' => 'nullable|exists:accounts,id',
            'branch_id' => 'nullable|exists:branches,id',
            'source' => 'sometimes|required|in:pos_sale,manual_income,other_income',
            'category' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'amount' => 'sometimes|required|numeric|min:0',
            'income_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $income = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $income,
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
