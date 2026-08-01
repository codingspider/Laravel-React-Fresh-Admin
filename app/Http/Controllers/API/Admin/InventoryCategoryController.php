<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\InventoryCategory;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Modules\Restaurant\Models\Restaurant;

class InventoryCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryCategory::query();

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%');
        });

        $categories = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($request->input('per_page', 100));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_categories_fetched'),
            'data' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
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

        $category = InventoryCategory::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_category_created'),
            'data' => $category,
        ], 201);
    }

    public function show($id)
    {
        $category = InventoryCategory::findOrFail($id);

        $restaurantId = getRestaurantId();
        if ($restaurantId && $category->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'data' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = InventoryCategory::findOrFail($id);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId && $category->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_category_updated'),
            'data' => $category,
        ]);
    }

    public function destroy($id)
    {
        $category = InventoryCategory::findOrFail($id);

        $restaurantId = getRestaurantId();
        if ($restaurantId && $category->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_category_deleted'),
        ]);
    }
}
