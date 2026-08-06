<?php

namespace Modules\Reports\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Reports\Services\ReportService;

class ReportController extends Controller
{
    protected string $langKey = 'reports::module';

    public function __construct(protected ReportService $service) {}

    /**
     * Filter options for the report filter bars.
     */
    public function meta(Request $request): JsonResponse
    {
        $data = $this->service->meta(getRestaurantId($request->user()));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $data,
        ]);
    }

    /**
     * Generate the sales report.
     */
    public function saleReport(Request $request): JsonResponse
    {
        $data = $this->service->saleReport(
            getRestaurantId($request->user()),
            $request->only(['date_from', 'date_to', 'branch_id', 'order_type', 'payment_status', 'status'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Generate the purchase report.
     */
    public function purchaseReport(Request $request): JsonResponse
    {
        $data = $this->service->purchaseReport(
            getRestaurantId($request->user()),
            $request->only(['date_from', 'date_to', 'branch_id', 'supplier_id', 'status'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Generate the tax report.
     */
    public function taxReport(Request $request): JsonResponse
    {
        $data = $this->service->taxReport(
            getRestaurantId($request->user()),
            $request->only(['date_from', 'date_to', 'branch_id'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }

    /**
     * Generate the expense report.
     */
    public function expenseReport(Request $request): JsonResponse
    {
        $data = $this->service->expenseReport(
            getRestaurantId($request->user()),
            $request->only(['date_from', 'date_to', 'branch_id', 'expense_category_id', 'payment_method'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.report_generated'),
            'data' => $data,
        ]);
    }
}
