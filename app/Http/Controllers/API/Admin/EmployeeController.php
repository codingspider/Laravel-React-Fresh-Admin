<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmEmployee;
use App\Services\EmployeeService;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(protected EmployeeService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'branch_id', 'department_id', 'designation_id']);
        $filters['restaurant_id'] = $restaurantId;

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.employees_fetched'),
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
            'branch_id' => 'nullable|exists:branches,id',
            'user_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:hrm_departments,id',
            'designation_id' => 'nullable|exists:hrm_designations,id',
            'employee_id' => 'nullable|string|max:255|unique:hrm_employees,employee_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'date_of_joining' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'photo' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,terminated',
        ]);

        $data['restaurant_id'] = $restaurantId;
        $data['employee_id'] = $data['employee_id'] ?? $this->service->generateEmployeeId($restaurantId);

        if (!empty($data['photo']) && $data['photo'] !== $request->input('photo')) {
            // Photo handling would be done via uploadImage helper
        }

        $employee = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.employee_created'),
            'data' => $employee,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $employee = $this->service->getDetails($id);

        if (!$employee) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.employee_not_found'),
            ], 404);
        }

        $this->authorizeOwnership($employee);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.employee_fetched'),
            'data' => $employee,
        ]);
    }

    public function update(Request $request, $id)
    {
        $employee = HrmEmployee::findOrFail($id);
        $this->authorizeOwnership($employee);

        $data = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'user_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:hrm_departments,id',
            'designation_id' => 'nullable|exists:hrm_designations,id',
            'employee_id' => 'nullable|string|max:255|unique:hrm_employees,employee_id,' . $id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'date_of_joining' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'photo' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,terminated',
        ]);

        $employee = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.employee_updated'),
            'data' => $employee,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $employee = HrmEmployee::findOrFail($id);
        $this->authorizeOwnership($employee);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.employee_deleted'),
        ]);
    }

    protected function authorizeOwnership(HrmEmployee $employee): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $employee->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }

    public function options(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());

        $departments = \App\Models\HrmDepartment::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $designations = \App\Models\HrmDesignation::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $branches = \Modules\Branch\Models\Branch::where('restaurant_id', $restaurantId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.employee_options_fetched'),
            'data' => [
                'departments' => $departments,
                'designations' => $designations,
                'branches' => $branches,
            ],
        ]);
    }
}
