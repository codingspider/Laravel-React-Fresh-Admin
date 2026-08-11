<?php

namespace Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CRM\Http\Controllers\Traits\CrmAccess;
use Modules\CRM\Services\CrmDashboardService;

class CrmDashboardController extends Controller
{
    use CrmAccess;

    protected string $langKey = 'crm::module';

    public function __construct(protected CrmDashboardService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'view_crm_dashboard');

        $restaurantId = $this->restaurantId($request);
        $filters = $request->only(['branch_id', 'date_from', 'date_to']);
        $summary = $restaurantId ? $this->service->summary($restaurantId, $filters) : $this->emptySummary();

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.dashboard_fetched'),
            'data' => $summary,
        ]);
    }

    /**
     * Empty summary shape for un-scoped (super admin) requests.
     *
     * @return array<string, mixed>
     */
    protected function emptySummary(): array
    {
        return [
            'total_customers' => 0,
            'new_customers_this_month' => 0,
            'active_customers' => 0,
            'total_spent' => 0.0,
            'pending_follow_ups' => 0,
            'upcoming_birthdays' => [],
            'upcoming_anniversaries' => [],
            'segment_breakdown' => [],
            'recent_customers' => [],
        ];
    }
}
