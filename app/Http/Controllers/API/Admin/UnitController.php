<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\Unit;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Modules\Restaurant\Models\Restaurant;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::query();

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('actual_name', 'like', '%' . $request->search . '%')
                    ->orWhere('short_name', 'like', '%' . $request->search . '%');
            });
        });

        $units = $query->orderBy('actual_name')
            ->paginate($request->input('per_page', 200));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.units_fetched'),
            'data' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'actual_name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
            'allow_decimal' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $restaurantId = $request->input('restaurant_id') ?? getRestaurantId($request->user());
        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.restaurant_required'),
            ], 422);
        }

        $validated['restaurant_id'] = $restaurantId;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $unit = Unit::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.unit_created'),
            'data' => $unit,
        ], 201);
    }

    public function show($id)
    {
        $unit = Unit::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $unit,
        ]);
    }

    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId && $unit->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'actual_name' => 'sometimes|required|string|max:255',
            'short_name' => 'sometimes|required|string|max:50',
            'allow_decimal' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $unit->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.unit_updated'),
            'data' => $unit,
        ]);
    }

    public function destroy($id)
    {
        $unit = Unit::findOrFail($id);

        $restaurantId = getRestaurantId();
        if ($restaurantId && $unit->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        $unit->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.unit_deleted'),
        ]);
    }
}
