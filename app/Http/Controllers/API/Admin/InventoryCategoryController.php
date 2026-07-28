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

        if (!isSuperAdmin($request->user())) {
            $query->where('restaurant_id', $request->user()->id);
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

        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $validated['restaurant_id'] = $restaurant?->id ?? $request->user()->id;
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

        return response()->json([
            'status' => 'success',
            'data' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = InventoryCategory::findOrFail($id);

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
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_category_deleted'),
        ]);
    }
}
