<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmLeaveRequest;
use App\Services\LeaveService;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function __construct(protected LeaveService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'branch_id', 'employee_id']);
        $filters['restaurant_id'] = $restaurantId;

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.leave_requests_fetched'),
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $restaurantId = getRestaurantId($request->user()) ?? $request->user()->restaurant_id;
        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.restaurant_required'),
            ], 422);
        }

        $data = $request->validate([
            'employee_id' => 'required|exists:hrm_employees,id',
            'branch_id' => 'nullable|exists:branches,id',
            'type' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $data['restaurant_id'] = $restaurantId;
        $data['days'] = \Carbon\Carbon::parse($data['start_date'])->diffInDays(\Carbon\Carbon::parse($data['end_date'])) + 1;

        $leave = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.leave_request_created'),
            'data' => $leave,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $leave = $this->service->find($id);

        if (!$leave) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.leave_request_not_found'),
            ], 404);
        }

        $this->authorizeOwnership($leave);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.leave_request_fetched'),
            'data' => $leave,
        ]);
    }

    public function update(Request $request, $id)
    {
        $leave = HrmLeaveRequest::findOrFail($id);
        $this->authorizeOwnership($leave);

        $data = $request->validate([
            'employee_id' => 'sometimes|required|exists:hrm_employees,id',
            'type' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'days' => 'sometimes|required|integer|min:1',
            'reason' => 'nullable|string',
            'status' => 'nullable|in:pending,approved,rejected,cancelled',
            'approved_by' => 'nullable|exists:users,id',
            'approved_at' => 'nullable|date',
            'approval_notes' => 'nullable|string',
        ]);

        $leave = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.leave_request_updated'),
            'data' => $leave,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $leave = HrmLeaveRequest::findOrFail($id);
        $this->authorizeOwnership($leave);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.leave_request_deleted'),
        ]);
    }

    public function approve(Request $request, $id)
    {
        $leave = HrmLeaveRequest::findOrFail($id);
        $this->authorizeOwnership($leave);

        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $leave = $this->service->approve($id, $data['status'] === 'approved', $data['notes'] ?? null);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.leave_request_approved'),
            'data' => $leave,
        ]);
    }

    protected function authorizeOwnership(HrmLeaveRequest $leave): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $leave->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
