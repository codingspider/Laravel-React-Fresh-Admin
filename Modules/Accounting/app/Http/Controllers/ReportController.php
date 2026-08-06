<?php

namespace Modules\Accounting\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Modules\Accounting\Services\ReportService;

class ReportController extends Controller
{
    protected string $langKey = 'accounting::module';

    public function __construct(protected ReportService $reportService) {}

    public function profitAndLoss(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['date_from', 'date_to', 'branch_id']);

        $data = $this->reportService->profitAndLoss(
            $restaurantId,
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null,
            $filters['branch_id'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.report_generated'),
            'data' => $data,
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $dateTo = $request->input('date_to');

        $data = $this->reportService->balanceSheet($restaurantId, $dateTo);

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.report_generated'),
            'data' => $data,
        ]);
    }

    public function cashFlow(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['date_from', 'date_to']);

        $data = $this->reportService->cashFlow(
            $restaurantId,
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.report_generated'),
            'data' => $data,
        ]);
    }

    public function dashboard(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());

        $data = $this->reportService->dashboard($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.dashboard_fetched'),
            'data' => $data,
        ]);
    }
}
