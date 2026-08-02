<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Recipe;
use App\Models\RecipeCategory;
use App\Models\Unit;
use App\Services\RecipeService;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function __construct(protected RecipeService $service) {}

    public function index(Request $request)
    {
        $query = Recipe::with(['category:id,name', 'yieldUnit:id,actual_name,short_name', 'ingredients.inventoryItem:id,name,unit_cost']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%');
        });

        $query->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->category_id));
        $query->when($request->filled('status'), fn($q) => $q->where('status', $request->status));

        $recipes = $query->orderBy('name')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipes_fetched'),
            'data' => $recipes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:recipe_categories,id',
            'menu_item_id' => 'nullable|exists:menu_items,id',
            'description' => 'nullable|string',
            'selling_price' => 'nullable|numeric|min:0',
            'yield_quantity' => 'nullable|numeric|min:0',
            'yield_unit_id' => 'nullable|exists:units,id',
            'auto_deduct_stock' => 'nullable|in:yes,no',
            'preparation_notes' => 'nullable|string',
            'cooking_instructions' => 'nullable|string',
            'preparation_time' => 'nullable|integer|min:0',
            'cooking_time' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'ingredients.*.quantity' => 'nullable|numeric|min:0',
            'ingredients.*.unit_id' => 'nullable|exists:units,id',
            'ingredients.*.unit_cost' => 'nullable|numeric|min:0',
            'ingredients.*.is_optional' => 'nullable|boolean',
            'ingredients.*.notes' => 'nullable|string',
        ]);

        $validated['restaurant_id'] = getRestaurantId($request->user()) ?? $request->user()->restaurant_id;

        $recipe = $this->service->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_created'),
            'data' => $recipe,
        ], 201);
    }

    public function show($id)
    {
        $recipe = Recipe::with(['category', 'yieldUnit', 'ingredients.inventoryItem', 'ingredients.unit', 'menuItem'])
            ->findOrFail($id);

        $this->authorizeOwnership($recipe);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_fetched'),
            'data' => $recipe,
        ]);
    }

    public function update(Request $request, $id)
    {
        $recipe = Recipe::findOrFail($id);
        $this->authorizeOwnership($recipe);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'nullable|exists:recipe_categories,id',
            'menu_item_id' => 'nullable|exists:menu_items,id',
            'description' => 'nullable|string',
            'selling_price' => 'nullable|numeric|min:0',
            'yield_quantity' => 'nullable|numeric|min:0',
            'yield_unit_id' => 'nullable|exists:units,id',
            'auto_deduct_stock' => 'nullable|in:yes,no',
            'preparation_notes' => 'nullable|string',
            'cooking_instructions' => 'nullable|string',
            'preparation_time' => 'nullable|integer|min:0',
            'cooking_time' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'ingredients.*.quantity' => 'nullable|numeric|min:0',
            'ingredients.*.unit_id' => 'nullable|exists:units,id',
            'ingredients.*.unit_cost' => 'nullable|numeric|min:0',
            'ingredients.*.is_optional' => 'nullable|boolean',
            'ingredients.*.notes' => 'nullable|string',
        ]);

        $recipe = $this->service->update($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_updated'),
            'data' => $recipe,
        ]);
    }

    public function destroy($id)
    {
        $recipe = Recipe::findOrFail($id);
        $this->authorizeOwnership($recipe);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.recipe_deleted'),
        ]);
    }

    public function options(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());

        $categories = RecipeCategory::query()
            ->when($restaurantId, fn($q) => $q->where('restaurant_id', $restaurantId))
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $units = Unit::query()
            ->when($restaurantId, fn($q) => $q->where('restaurant_id', $restaurantId))
            ->active()
            ->orderBy('actual_name')
            ->get(['id', 'actual_name', 'short_name']);

        $items = InventoryItem::query()
            ->when($restaurantId, fn($q) => $q->where('restaurant_id', $restaurantId))
            ->whereIn('type', ['raw_material', 'both'])
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'unit_cost', 'cost_price', 'current_stock']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'categories' => $categories,
                'units' => $units,
                'inventory_items' => $items,
            ],
        ]);
    }

    protected function authorizeOwnership(Recipe $recipe): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $recipe->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
