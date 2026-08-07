<?php

namespace Modules\SuperAdmin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\SuperAdmin\Services\ReportsService;

class ReportsController extends Controller
{
    protected string $langKey = 'superadmin::module';

    public function __construct(protected ReportsService $service) {}

    /**
     * Platform overview — combined summary across all modules.
     */
    public function overview(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $data = $this->service->platformOverview();

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Package report.
     */
    public function packageReport(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $data = $this->service->packageReport(
            $request->only(['status'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Plan report.
     */
    public function planReport(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $data = $this->service->planReport(
            $request->only(['status', 'is_active'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Subscription report.
     */
    public function subscriptionReport(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $data = $this->service->subscriptionReport(
            $request->only(['status', 'payment_status', 'is_trial', 'date_from', 'date_to'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Restaurant report.
     */
    public function restaurantReport(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $data = $this->service->restaurantReport(
            $request->only(['status'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }
}
