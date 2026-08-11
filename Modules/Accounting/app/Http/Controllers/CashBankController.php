<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Http\Requests\StoreCashBankRequest;
use Modules\Accounting\Http\Requests\UpdateCashBankRequest;
use Modules\Accounting\Services\CashBankService;

class CashBankController extends Controller
{
    protected string $langKey = 'accounting::module';

    public function __construct(protected CashBankService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'type', 'date_from', 'date_to', 'branch_id']);
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

    public function store(StoreCashBankRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $data = $request->validated();

        $data['restaurant_id'] = $restaurantId;
        $data['status'] = $data['status'] ?? 'completed';

        $transaction = match($data['type']) {
            'cash_deposit', 'bank_deposit' => $this->service->cashDeposit($data),
            'cash_withdraw', 'bank_withdraw' => $this->service->cashWithdraw($data),
            'transfer' => $this->service->transfer($data),
            default => $this->service->cashDeposit($data),
        };

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $transaction,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $transaction = $this->service->find($id);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.not_found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $transaction,
        ]);
    }

    public function update(UpdateCashBankRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $transaction = CashBankTransaction::findOrFail($id);
        $transaction->update($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $transaction->load(['account', 'fromAccount', 'toAccount']),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $transaction = \Modules\Accounting\Models\CashBankTransaction::findOrFail($id);
        $transaction->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function accounts(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $type = $request->input('type', 'all');

        $accounts = match($type) {
            'cash' => $this->service->cashAccounts($restaurantId),
            'bank' => $this->service->bankAccounts($restaurantId),
            default => $this->service->allAssetAccounts($restaurantId),
        };

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $accounts,
        ]);
    }
}
