<?php

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Http\Requests\StoreSmsTemplateRequest;
use Modules\Notification\Http\Requests\UpdateSmsTemplateRequest;
use Modules\Notification\Services\NotificationSettingService;
use Modules\Notification\Services\SmsTemplateService;

class SmsTemplateController extends Controller
{
    public function __construct(protected SmsTemplateService $templates)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $branchId = $this->resolvedBranchId($request);

        $templates = $this->templates->forBranch($restaurantId, $branchId);

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.fetched_list'),
            'data' => $templates,
        ]);
    }

    public function store(StoreSmsTemplateRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $branchId = $this->resolvedBranchId($request);

        $template = $this->templates->create(
            $restaurantId,
            $branchId,
            $request->validated()
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.template_created'),
            'data' => $template,
        ], 201);
    }

    public function update(UpdateSmsTemplateRequest $request, int $template): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $branchId = $this->resolvedBranchId($request);

        $template = $this->templates->update(
            $restaurantId,
            $branchId,
            $template,
            $request->validated()
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.template_updated'),
            'data' => $template,
        ]);
    }

    public function destroy(Request $request, int $template): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());

        $branchId = $this->resolvedBranchId($request);

        $this->templates->delete($restaurantId, $branchId, $template);

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.template_deleted'),
        ]);
    }

    /**
     * Resolve the branch for the request and block branch-scoped users from
     * managing templates of other branches.
     */
    protected function resolvedBranchId(Request $request): ?int
    {
        $restaurantId = getRestaurantId($request->user());

        $branchId = app(NotificationSettingService::class)->resolveBranchId(
            $restaurantId,
            $request->input('branch_id')
        );

        if (getBranchId() !== null && $branchId !== getBranchId()) {
            abort(403, trans('notification::module.unauthorized'));
        }

        return $branchId;
    }
}
