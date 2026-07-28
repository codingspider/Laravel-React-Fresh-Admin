<?php

namespace Modules\Subscription\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Subscription\Http\Requests\StoreSubscriptionRequest;
use Modules\Subscription\Http\Requests\UpdateSubscriptionRequest;
use Modules\Subscription\Resources\SubscriptionResource;
use Modules\Subscription\Services\SubscriptionService;

class SubscriptionController extends Controller
{
    protected string $langKey = 'subscription::module';

    public function __construct(protected SubscriptionService $service) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            array_merge(
                $request->only(['search', 'status', 'payment_status', 'restaurant_id']),
                ['scope_restaurant_id' => $restaurantId]
            )
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => SubscriptionResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $item = $this->service->create($validated);

        $item->load(['restaurant', 'plan']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new SubscriptionResource($item),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);
        $item->load(['restaurant', 'plan', 'plan.packages']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new SubscriptionResource($item),
        ]);
    }

    public function update(UpdateSubscriptionRequest $request, $id): JsonResponse
    {
        $item = $this->service->update($id, $request->validated());
        $item->load(['restaurant', 'plan']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new SubscriptionResource($item),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function getModules($id): JsonResponse
    {
        $subscription = $this->service->find($id);
        $subscription->load('plan.packages');

        $allowedModules = [];
        foreach ($subscription->plan->packages as $package) {
            $allowedModules = array_merge($allowedModules, $package->modules ?? []);
        }
        $allowedModules = array_unique($allowedModules);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_modules'),
            'data' => [
                'subscription_id' => $subscription->id,
                'plan' => $subscription->plan->name,
                'modules' => array_values($allowedModules),
            ],
        ]);
    }
}
