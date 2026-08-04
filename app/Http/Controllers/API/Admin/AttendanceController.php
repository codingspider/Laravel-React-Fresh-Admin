<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmAttendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(protected AttendanceService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'branch_id', 'employee_id', 'date_from', 'date_to']);
        $filters['restaurant_id'] = $restaurantId;

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.attendance_fetched'),
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
            'date' => 'required|date',
            'clock_in' => 'nullable|date_format:H:i:s',
            'clock_out' => 'nullable|date_format:H:i:s',
            'break_start' => 'nullable|date_format:H:i:s',
            'break_end' => 'nullable|date_format:H:i:s',
            'work_hours' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'status' => 'required|in:present,absent,late,half_day,holiday,weekend',
            'notes' => 'nullable|string',
        ]);

        $data['restaurant_id'] = $restaurantId;

        if (empty($data['branch_id']) && $request->user()->branch_id) {
            $data['branch_id'] = $request->user()->branch_id;
        }

        $attendance = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.attendance_created'),
            'data' => $attendance,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $attendance = $this->service->find($id);

        if (!$attendance) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.attendance_not_found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('message.attendance_fetched'),
            'data' => $attendance,
        ]);
    }

    public function update(Request $request, $id)
    {
        $attendance = HrmAttendance::findOrFail($id);
        $this->authorizeOwnership($attendance);

        $data = $request->validate([
            'employee_id' => 'sometimes|required|exists:hrm_employees,id',
            'branch_id' => 'nullable|exists:branches,id',
            'date' => 'sometimes|required|date',
            'clock_in' => 'nullable|date_format:H:i:s',
            'clock_out' => 'nullable|date_format:H:i:s',
            'break_start' => 'nullable|date_format:H:i:s',
            'break_end' => 'nullable|date_format:H:i:s',
            'work_hours' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:present,absent,late,half_day,holiday,weekend',
            'notes' => 'nullable|string',
        ]);

        $attendance = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.attendance_updated'),
            'data' => $attendance,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $attendance = HrmAttendance::findOrFail($id);
        $this->authorizeOwnership($attendance);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.attendance_deleted'),
        ]);
    }

    public function bulkStore(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:hrm_employees,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,half_day,holiday,weekend',
            'clock_in' => 'nullable|date_format:H:i:s',
            'clock_out' => 'nullable|date_format:H:i:s',
            'work_hours' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $data['restaurant_id'] = getRestaurantId($request->user());
        $attendance = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.attendance_created'),
            'data' => $attendance,
        ], 201);
    }

    protected function authorizeOwnership(HrmAttendance $attendance): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $attendance->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
