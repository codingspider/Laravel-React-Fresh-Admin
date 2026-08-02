<?php

namespace Modules\KitchenDisplay\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\KitchenDisplay\Http\Requests\AssignChefRequest;
use Modules\KitchenDisplay\Http\Requests\SetPriorityRequest;
use Modules\KitchenDisplay\Http\Requests\UpdateKitchenStatusRequest;
use Modules\KitchenDisplay\Services\KitchenDisplayService;
use Modules\POS\Models\Sale;

class KitchenDisplayController extends Controller
{
    protected string $langKey = 'kitchendisplay::module';

    public function __construct(protected KitchenDisplayService $service) {}

    /**
     * GET /api/v1/kitchen/display
     * Live kitchen board: orders grouped by status column plus aggregate stats.
     */
    public function board(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('view_kitchen_display'), 403);

        $filters = [
            'restaurant_id' => getRestaurantId(),
            'branch_id' => $request->input('branch_id'),
        ];

        $data = $this->service->board($filters);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $data,
        ]);
    }

    /**
     * GET /api/v1/kitchen/chefs
     * Kitchen staff available for chef assignment.
     */
    public function chefs(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('view_kitchen_display'), 403);

        $chefs = $this->service->chefs(getRestaurantId())->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $chefs,
        ]);
    }

    /**
     * POST /api/v1/kitchen/orders/{saleId}/status
     * Accept (confirmed), start cooking (preparing), mark ready, serve or cancel.
     */
    public function updateStatus(UpdateKitchenStatusRequest $request, $saleId): JsonResponse
    {
        abort_unless($request->user()->can('manage_kitchen_orders'), 403);

        $sale = $this->findScopedSale($saleId, $request);
        $sale = $this->service->updateStatus($sale, $request->validated()['status']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.status_changed'),
            'data' => ['id' => $sale->id, 'status' => $sale->status],
        ]);
    }

    /**
     * POST /api/v1/kitchen/orders/{saleId}/priority
     * Update the priority queue level of an order.
     */
    public function setPriority(SetPriorityRequest $request, $saleId): JsonResponse
    {
        abort_unless($request->user()->can('manage_kitchen_orders'), 403);

        $sale = $this->findScopedSale($saleId, $request);
        $sale = $this->service->setPriority($sale, $request->validated()['priority']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => ['id' => $sale->id, 'priority' => $sale->priority],
        ]);
    }

    /**
     * POST /api/v1/kitchen/orders/{saleId}/chef
     * Assign (or clear) the chef responsible for an order.
     */
    public function assignChef(AssignChefRequest $request, $saleId): JsonResponse
    {
        abort_unless($request->user()->can('assign_chef'), 403);

        $sale = $this->findScopedSale($saleId, $request);
        $sale = $this->service->assignChef($sale, $request->validated()['chef_user_id']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.chef_assigned'),
            'data' => ['id' => $sale->id, 'chef_user_id' => $sale->chef_user_id],
        ]);
    }

    /**
     * Find a sale owned by the current restaurant scope, or abort.
     */
    protected function findScopedSale($saleId, Request $request): Sale
    {
        $restaurantId = getRestaurantId();
        $query = Sale::where('id', $saleId);

        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        return $query->firstOrFail();
    }
}
