<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmDepartment;
use App\Services\DepartmentService;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function __construct(protected DepartmentService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'status', 'branch_id']);
        $filters['restaurant_id'] = $restaurantId;

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.departments_fetched'),
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
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:hrm_departments,slug',
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ]);

        $data['restaurant_id'] = $restaurantId;

        $department = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.department_created'),
            'data' => $department,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $department = $this->service->find($id);

        if (!$department) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.department_not_found'),
            ], 404);
        }

        $this->authorizeOwnership($department);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.department_fetched'),
            'data' => $department,
        ]);
    }

    public function update(Request $request, $id)
    {
        $department = HrmDepartment::findOrFail($id);
        $this->authorizeOwnership($department);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:hrm_departments,slug,' . $id,
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ]);

        $department = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.department_updated'),
            'data' => $department,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $department = HrmDepartment::findOrFail($id);
        $this->authorizeOwnership($department);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.department_deleted'),
        ]);
    }

    protected function authorizeOwnership(HrmDepartment $department): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $department->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
