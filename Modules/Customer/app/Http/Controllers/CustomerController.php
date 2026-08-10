<?php

namespace Modules\Customer\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Customer\Services\CustomerService;
use Modules\Customer\Http\Requests\StoreCustomerRequest;
use Modules\Customer\Http\Requests\UpdateCustomerRequest;

class CustomerController extends Controller
{
    protected string $langKey = 'customer::module';

    public function __construct(protected CustomerService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->input('search'),
            'branch_id' => $request->input('branch_id'),
            'is_active' => $request->filled('is_active') ? (bool) $request->input('is_active') : null,
            'restaurant_id' => $request->input('restaurant_id') ?? getRestaurantId(),
        ];

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $data,
        ]);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['restaurant_id'] = $request->input('restaurant_id') ?? getRestaurantId();

        if (!$data['restaurant_id']) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.restaurant_required'),
            ], 422);
        }

        $data['is_active'] = $data['is_active'] ?? true;

        $item = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $item,
        ], 201);
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
            'data' => $item,
        ]);
    }

    public function update(UpdateCustomerRequest $request, $id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validated();
        $data['restaurant_id'] = $request->input('restaurant_id') ?? $item->restaurant_id;

        $item = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $item,
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
