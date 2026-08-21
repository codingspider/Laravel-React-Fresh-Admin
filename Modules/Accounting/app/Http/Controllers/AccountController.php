<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Http\Controllers\Concerns\AuthorizesRestaurant;
use Modules\Accounting\Http\Requests\StoreAccountRequest;
use Modules\Accounting\Http\Requests\UpdateAccountRequest;
use Modules\Accounting\Services\AccountService;
use Modules\Accounting\Models\Account;

class AccountController extends Controller
{
    use AuthorizesRestaurant;

    protected string $langKey = 'accounting::module';

    public function __construct(protected AccountService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'type', 'account_group', 'status', 'branch_id']);
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

    public function store(StoreAccountRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $data = $request->validated();

        $data['restaurant_id'] = $restaurantId;

        $account = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $account,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $account = $this->service->find($id);

        if (!$account) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.not_found'),
            ], 404);
        }

        $this->authorizeOwned($request, $account->restaurant_id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $account,
        ]);
    }

    public function update(UpdateAccountRequest $request, int $id): JsonResponse
    {
        $existing = Account::findOrFail($id);
        $this->authorizeOwned($request, $existing->restaurant_id);

        $data = $request->validated();

        $account = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $account,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $existing = Account::findOrFail($id);
        $this->authorizeOwned($request, $existing->restaurant_id);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function tree(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $tree = $this->service->tree($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $tree,
        ]);
    }
}
