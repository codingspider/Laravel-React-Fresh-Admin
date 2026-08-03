<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrmHoliday;
use App\Services\HolidayService;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function __construct(protected HolidayService $service) {}

    public function index(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());
        $year = $request->input('year', date('Y'));

        $filters = $request->only(['search', 'status', 'branch_id']);
        $filters['restaurant_id'] = $restaurantId;
        $filters['year'] = $year;

        $data = $this->service->paginate(
            100,
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.holidays_fetched'),
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
            'date' => 'required|date',
            'type' => 'nullable|in:fixed,recurring,one_time',
            'status' => 'nullable|in:active,inactive',
            'is_optional' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $data['restaurant_id'] = $restaurantId;

        $holiday = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.holiday_created'),
            'data' => $holiday,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $holiday = $this->service->find($id);

        if (!$holiday) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.holiday_not_found'),
            ], 404);
        }

        $this->authorizeOwnership($holiday);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.holiday_fetched'),
            'data' => $holiday,
        ]);
    }

    public function update(Request $request, $id)
    {
        $holiday = HrmHoliday::findOrFail($id);
        $this->authorizeOwnership($holiday);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'type' => 'nullable|in:fixed,recurring,one_time',
            'status' => 'nullable|in:active,inactive',
            'is_optional' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $holiday = $this->service->update($id, $data);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.holiday_updated'),
            'data' => $holiday,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $holiday = HrmHoliday::findOrFail($id);
        $this->authorizeOwnership($holiday);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.holiday_deleted'),
        ]);
    }

    protected function authorizeOwnership(HrmHoliday $holiday): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $holiday->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
