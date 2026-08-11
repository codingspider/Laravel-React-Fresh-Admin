<?php

namespace Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CRM\Http\Controllers\Traits\CrmAccess;
use Modules\CRM\Http\Requests\StoreCrmCustomerRequest;
use Modules\CRM\Http\Requests\UpdateCrmCustomerRequest;
use Modules\CRM\Http\Resources\CrmCustomerResource;
use Modules\CRM\Services\CrmCustomerService;
use Modules\Customer\Models\Customer;

class CrmCustomerController extends Controller
{
    use CrmAccess;

    protected string $langKey = 'crm::module';

    public function __construct(protected CrmCustomerService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'view_customers');

        $filters = $request->only(['search', 'segment_id', 'lead_status', 'source', 'birthday_month', 'min_spend', 'branch_id']);
        $filters['restaurant_id'] = $this->restaurantId($request);

        if ($request->filled('is_active')) {
            $filters['is_active'] = (bool) $request->input('is_active');
        }

        $data = $this->service->paginate(
            (int) $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.customers_fetched'),
            'data' => CrmCustomerResource::collection($data),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'view_customers');

        $customer = $this->service->find($id);
        $this->ensureOwned($customer->restaurant_id, $this->restaurantId($request));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.customer_fetched'),
            'data' => new CrmCustomerResource($customer),
        ]);
    }

    public function store(StoreCrmCustomerRequest $request): JsonResponse
    {
        $this->authorizeAction($request, 'create_customers');

        $data = $request->validated();
        $data['restaurant_id'] = $data['restaurant_id'] ?? $this->restaurantId($request);

        if (!$data['restaurant_id']) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.restaurant_required'),
            ], 422);
        }

        $data['is_active'] = $data['is_active'] ?? true;
        $data['source'] = $data['source'] ?? 'manual';

        $customer = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.customer_created'),
            'data' => new CrmCustomerResource($customer),
        ], 201);
    }

    public function update(UpdateCrmCustomerRequest $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'update_customers');

        $existing = Customer::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $data = $request->validated();
        $data['restaurant_id'] = $data['restaurant_id'] ?? $existing->restaurant_id;

        $customer = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.customer_updated'),
            'data' => new CrmCustomerResource($customer),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'delete_customers');

        $existing = Customer::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.customer_deleted'),
        ]);
    }
}
