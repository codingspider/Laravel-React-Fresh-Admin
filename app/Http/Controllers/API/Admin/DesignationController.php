<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmDesignation;
use App\Services\DesignationService;
use Illuminate\Http\Request;

class DesignationController extends Controller
{
    public function __construct(protected DesignationService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $filters = $request->only(['search', 'department_id', 'status']);
        $filters['restaurant_id'] = $restaurantId;

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.designations_fetched'),
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
            'department_id' => 'nullable|exists:hrm_departments,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:hrm_designations,slug',
            'description' => 'nullable|string',
            'min_salary' => 'nullable|numeric|min:0',
            'max_salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ]);

        $data['restaurant_id'] = $restaurantId;

        $designation = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.designation_created'),
            'data' => $designation,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $designation = $this->service->find($id);

        if (!$designation) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.designation_not_found'),
            ], 404);
        }

        $this->authorizeOwnership($designation);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.designation_fetched'),
            'data' => $designation,
        ]);
    }

    public function update(Request $request, $id)
    {
        $designation = HrmDesignation::findOrFail($id);
        $this->authorizeOwnership($designation);

        $data = $request->validate([
            'department_id' => 'nullable|exists:hrm_departments,id',
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:hrm_designations,slug,' . $id,
            'description' => 'nullable|string',
            'min_salary' => 'nullable|numeric|min:0',
            'max_salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ]);

        $designation = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.designation_updated'),
            'data' => $designation,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $designation = HrmDesignation::findOrFail($id);
        $this->authorizeOwnership($designation);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.designation_deleted'),
        ]);
    }

    protected function authorizeOwnership(HrmDesignation $designation): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $designation->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }

    public function byDepartment(Request $request, $departmentId)
    {
        $restaurantId = getRestaurantId($request->user());

        $query = HrmDesignation::where('restaurant_id', $restaurantId)
            ->where('department_id', $departmentId)
            ->where('status', 'active')
            ->orderBy('name');

        $designations = $query->get();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.designations_fetched'),
            'data' => $designations,
        ]);
    }
}
