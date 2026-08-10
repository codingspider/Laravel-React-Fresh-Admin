<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\RecipeCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RecipeCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = RecipeCategory::query()->with(['branch:id,name']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $query->when($request->filled('search'), fn($q) => $q->where('name', 'like', '%' . $request->search . '%'));

        $categories = $query->orderBy('name')->paginate($request->input('per_page', 100));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_categories_fetched'),
            'data' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
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
        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $category = RecipeCategory::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_category_created'),
            'data' => $category,
        ], 201);
    }

    public function show($id)
    {
        $category = RecipeCategory::findOrFail($id);

        $restaurantId = getRestaurantId();
        if ($restaurantId && $category->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        return response()->json(['status' => 'success', 'data' => $category]);
    }

    public function update(Request $request, $id)
    {
        $category = RecipeCategory::findOrFail($id);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId && $category->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_category_updated'),
            'data' => $category,
        ]);
    }

    public function destroy($id)
    {
        $category = RecipeCategory::findOrFail($id);

        $restaurantId = getRestaurantId();
        if ($restaurantId && $category->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_category_deleted'),
        ]);
    }
}
