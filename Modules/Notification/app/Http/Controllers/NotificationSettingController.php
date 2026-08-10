<?php

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Http\Requests\TestEmailRequest;
use Modules\Notification\Http\Requests\TestSmsRequest;
use Modules\Notification\Http\Requests\UpdateNotificationSettingsRequest;
use Modules\Notification\Services\EmailService;
use Modules\Notification\Services\NotificationSettingService;
use Modules\Notification\Services\SmsService;
use Modules\Notification\Services\SmsTemplateService;
use Modules\Branch\Models\Branch;
use Throwable;

class NotificationSettingController extends Controller
{
    public function __construct(
        protected NotificationSettingService $settings,
        protected SmsTemplateService $templates,
        protected SmsService $sms,
        protected EmailService $email
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $branchId = $request->integer('branch_id') ?: null;

        $resolvedBranchId = $this->settings->resolveBranchId($restaurantId, $branchId);

        $this->assertBranchAccess(getBranchId(), $resolvedBranchId);

        $setting = $this->settings->settings($restaurantId, $resolvedBranchId);

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.fetched'),
            'data' => [
                'branch_id' => $resolvedBranchId,
                'branch_name' => Branch::whereKey($resolvedBranchId)->value('name'),
                'config' => $setting->config,
            ],
        ]);
    }

    public function update(UpdateNotificationSettingsRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $branchId = $request->input('branch_id');

        $resolvedBranchId = $this->settings->resolveBranchId($restaurantId, $branchId);

        $this->assertBranchAccess(getBranchId(), $resolvedBranchId);

        $setting = $this->settings->update($restaurantId, $branchId, $request->input('config', []));

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.settings_updated'),
            'data' => [
                'branch_id' => $setting->branch_id,
                'config' => $setting->config,
            ],
        ]);
    }

    public function testSend(TestSmsRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $branchId = $request->input('branch_id');

        $resolvedBranchId = $this->settings->resolveBranchId($restaurantId, $branchId);

        $this->assertBranchAccess(getBranchId(), $resolvedBranchId);

        try {
            $result = $this->sms->send(
                $request->input('channel'),
                $request->input('to'),
                $request->input('body'),
                $restaurantId,
                $branchId
            );
        } catch (Throwable $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.test_sent', ['channel' => ucfirst($result['channel'])]),
            'data' => $result,
        ]);
    }

    public function testEmail(TestEmailRequest $request): JsonResponse
    {
        $restaurantId = getRestaurantId($request->user());
        $branchId = $request->input('branch_id');

        $resolvedBranchId = $this->settings->resolveBranchId($restaurantId, $branchId);

        $this->assertBranchAccess(getBranchId(), $resolvedBranchId);

        try {
            $this->email->send(
                $request->input('to'),
                trans('notification::module.test_email_subject'),
                trans('notification::module.test_email_body'),
                $restaurantId,
                $branchId
            );
        } catch (Throwable $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('notification::module.test_email_sent'),
        ]);
    }

    /**
     * Branch-scoped users may only manage settings for their own branch.
     */
    protected function assertBranchAccess(?int $userBranchId, ?int $branchId): void
    {
        if ($userBranchId !== null && $branchId !== $userBranchId) {
            abort(403, trans('notification::module.unauthorized'));
        }
    }
}
