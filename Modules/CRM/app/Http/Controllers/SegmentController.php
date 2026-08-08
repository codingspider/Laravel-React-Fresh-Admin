<?php

namespace Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CRM\Http\Controllers\Traits\CrmAccess;
use Modules\CRM\Http\Requests\StoreSegmentRequest;
use Modules\CRM\Http\Requests\UpdateSegmentRequest;
use Modules\CRM\Http\Resources\SegmentResource;
use Modules\CRM\Models\Segment;
use Modules\CRM\Services\SegmentService;

class SegmentController extends Controller
{
    use CrmAccess;

    protected string $langKey = 'crm::module';

    public function __construct(protected SegmentService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'view_segments');

        $filters = [
            'search' => $request->input('search'),
            'restaurant_id' => $this->restaurantId($request),
        ];

        $data = $this->service->paginate(
            (int) $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.segments_fetched'),
            'data' => SegmentResource::collection($data),
        ]);
    }

    /**
     * Lightweight list for dropdowns (no pagination).
     */
    public function all(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'view_segments');

        $restaurantId = $this->restaurantId($request);
        $data = $restaurantId ? $this->service->allForRestaurant($restaurantId) : collect();

        return response()->json([
            'status' => 'success',
            'data' => SegmentResource::collection($data),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'view_segments');

        $segment = $this->service->find($id);
        $this->ensureOwned($segment->restaurant_id, $this->restaurantId($request));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.segment_fetched'),
            'data' => new SegmentResource($segment),
        ]);
    }

    public function store(StoreSegmentRequest $request): JsonResponse
    {
        $this->authorizeAction($request, 'create_segments');

        $data = $request->validated();
        $data['restaurant_id'] = $data['restaurant_id'] ?? $this->restaurantId($request);

        if (!$data['restaurant_id']) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.restaurant_required'),
            ], 422);
        }

        $data['created_by'] = $request->user()->id;
        $customerIds = $data['customer_ids'] ?? [];
        unset($data['customer_ids']);

        $segment = $this->service->create($data);

        if (!empty($customerIds)) {
            $segment->customers()->syncWithoutDetaching($customerIds);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.segment_created'),
            'data' => new SegmentResource($segment->loadCount('customers')),
        ], 201);
    }

    public function update(UpdateSegmentRequest $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'update_segments');

        $existing = Segment::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $data = $request->validated();
        $customerIds = $data['customer_ids'] ?? null;
        unset($data['customer_ids'], $data['restaurant_id']);

        $segment = $this->service->update($id, $data);

        if ($customerIds !== null) {
            $segment->customers()->sync($customerIds);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.segment_updated'),
            'data' => new SegmentResource($segment),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'delete_segments');

        $existing = Segment::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.segment_deleted'),
        ]);
    }

    /**
     * Assign customers to a segment.
     */
    public function assignCustomers(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'update_segments');

        $request->validate([
            'customer_ids' => 'required|array|min:1',
            'customer_ids.*' => 'integer|exists:customers,id',
        ]);

        $existing = Segment::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $segment = $this->service->assignCustomers($id, $request->input('customer_ids'));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.segment_customers_assigned'),
            'data' => new SegmentResource($segment),
        ]);
    }
}
