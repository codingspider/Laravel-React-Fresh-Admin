<?php

namespace Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CRM\Http\Controllers\Traits\CrmAccess;
use Modules\CRM\Http\Requests\StoreFollowUpRequest;
use Modules\CRM\Http\Requests\UpdateFollowUpRequest;
use Modules\CRM\Http\Resources\FollowUpResource;
use Modules\CRM\Models\FollowUp;
use Modules\CRM\Services\FollowUpService;

class FollowUpController extends Controller
{
    use CrmAccess;

    protected string $langKey = 'crm::module';

    public function __construct(protected FollowUpService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'view_follow_ups');

        $filters = [
            'status' => $request->input('status'),
            'customer_id' => $request->input('customer_id'),
            'assigned_to' => $request->input('assigned_to'),
            'restaurant_id' => $this->restaurantId($request),
        ];

        $data = $this->service->paginate(
            (int) $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.follow_ups_fetched'),
            'data' => FollowUpResource::collection($data),
        ]);
    }

    public function store(StoreFollowUpRequest $request): JsonResponse
    {
        $this->authorizeAction($request, 'create_follow_ups');

        $data = $request->validated();
        $data['restaurant_id'] = $data['restaurant_id'] ?? $this->restaurantId($request);

        if (!$data['restaurant_id']) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.restaurant_required'),
            ], 422);
        }

        $data['created_by'] = $request->user()->id;

        $followUp = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.follow_up_created'),
            'data' => new FollowUpResource($followUp->load(['customer:id,name,phone', 'assignee:id,name'])),
        ], 201);
    }

    public function update(UpdateFollowUpRequest $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'update_follow_ups');

        $existing = FollowUp::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $data = $request->validated();
        unset($data['restaurant_id']);

        $followUp = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.follow_up_updated'),
            'data' => new FollowUpResource($followUp),
        ]);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'complete_follow_ups');

        $existing = FollowUp::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $followUp = $this->service->complete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.follow_up_completed'),
            'data' => new FollowUpResource($followUp),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'delete_follow_ups');

        $existing = FollowUp::findOrFail($id);
        $this->ensureOwned($existing->restaurant_id, $this->restaurantId($request));

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.follow_up_deleted'),
        ]);
    }
}
