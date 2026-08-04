<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmPayroll;
use App\Services\PayrollService;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function __construct(protected PayrollService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'employee_id', 'pay_period_start', 'pay_period_end']);
        $filters['restaurant_id'] = $restaurantId;

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('hrm::module.fetched'),
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $restaurantId = getRestaurantId($request->user()) ?? $request->user()->restaurant_id;
        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('hrm::module.error'),
            ], 422);
        }

        $data = $request->validate([
            'employee_id' => 'required|exists:hrm_employees,id',
            'branch_id' => 'nullable|exists:branches,id',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'basic_salary' => 'required|numeric|min:0',
            'working_days' => 'required|integer|min:0',
            'present_days' => 'nullable|integer|min:0',
            'total_working_hours' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'allowance' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'pf' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,paid,cancelled',
            'paid_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'allowances' => 'nullable|array',
            'allowances.*.type' => 'required_with:allowances|string|max:255',
            'allowances.*.amount' => 'required_with:allowances|numeric|min:0',
            'allowances.*.calculation_type' => 'required_with:allowances|in:fixed,percentage',
            'allowances.*.notes' => 'nullable|string',
            'deductions' => 'nullable|array',
            'deductions.*.type' => 'required_with:deductions|string|max:255',
            'deductions.*.amount' => 'required_with:deductions|numeric|min:0',
            'deductions.*.calculation_type' => 'required_with:deductions|in:fixed,percentage',
            'deductions.*.notes' => 'nullable|string',
        ]);

        $data['restaurant_id'] = $restaurantId;

        $payroll = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('hrm::module.created'),
            'data' => $payroll,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $payroll = $this->service->find($id);

        if (!$payroll) {
            return response()->json([
                'status' => 'error',
                'message' => trans('hrm::module.not_found'),
            ], 404);
        }

        $this->authorizeOwnership($payroll);

        return response()->json([
            'status' => 'success',
            'message' => trans('hrm::module.fetched'),
            'data' => $payroll,
        ]);
    }

    public function update(Request $request, $id)
    {
        $payroll = HrmPayroll::findOrFail($id);
        $this->authorizeOwnership($payroll);

        $data = $request->validate([
            'employee_id' => 'sometimes|required|exists:hrm_employees,id',
            'branch_id' => 'nullable|exists:branches,id',
            'pay_period_start' => 'sometimes|required|date',
            'pay_period_end' => 'sometimes|required|date|after_or_equal:pay_period_start',
            'basic_salary' => 'sometimes|required|numeric|min:0',
            'working_days' => 'sometimes|required|integer|min:0',
            'present_days' => 'nullable|integer|min:0',
            'total_working_hours' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'allowance' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'pf' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,paid,cancelled',
            'paid_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'allowances' => 'nullable|array',
            'allowances.*.type' => 'required_with:allowances|string|max:255',
            'allowances.*.amount' => 'required_with:allowances|numeric|min:0',
            'allowances.*.calculation_type' => 'required_with:allowances|in:fixed,percentage',
            'allowances.*.notes' => 'nullable|string',
            'deductions' => 'nullable|array',
            'deductions.*.type' => 'required_with:deductions|string|max:255',
            'deductions.*.amount' => 'required_with:deductions|numeric|min:0',
            'deductions.*.calculation_type' => 'required_with:deductions|in:fixed,percentage',
            'deductions.*.notes' => 'nullable|string',
        ]);

        $payroll = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('hrm::module.updated'),
            'data' => $payroll,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $payroll = HrmPayroll::findOrFail($id);
        $this->authorizeOwnership($payroll);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('hrm::module.deleted'),
        ]);
    }

    protected function authorizeOwnership(HrmPayroll $payroll): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $payroll->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
