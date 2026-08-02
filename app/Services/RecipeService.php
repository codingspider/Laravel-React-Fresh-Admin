<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Support\Facades\DB;

class RecipeService
{
    public function __construct(protected StockService $stockService) {}

    /**
     * Create a recipe with its ingredients and auto-calculate cost.
     */
    public function create(array $data): Recipe
    {
        return DB::transaction(function () use ($data) {
            $restaurantId = $data['restaurant_id'] ?? getRestaurantId();
            $data['restaurant_id'] = $restaurantId;
            $data['slug'] = $data['slug'] ?? \Illuminate\Support\Str::slug($data['name']);

            $ingredients = $data['ingredients'] ?? [];
            unset($data['ingredients']);

            $recipe = Recipe::create($data);
            $this->syncIngredients($recipe, $ingredients);
            $this->recalculate($recipe);

            return $recipe->fresh(['ingredients.inventoryItem', 'category', 'yieldUnit']);
        });
    }

    /**
     * Update a recipe and its ingredients.
     */
    public function update(int $id, array $data): Recipe
    {
        return DB::transaction(function () use ($id, $data) {
            $recipe = Recipe::findOrFail($id);

            if (isset($data['ingredients'])) {
                $ingredients = $data['ingredients'];
                unset($data['ingredients']);
            }

            $recipe->update($data);
            $this->syncIngredients($recipe, $ingredients ?? []);
            $this->recalculate($recipe);

            return $recipe->fresh(['ingredients.inventoryItem', 'category', 'yieldUnit']);
        });
    }

    /**
     * Replace recipe ingredients with the submitted set.
     */
    protected function syncIngredients(Recipe $recipe, array $ingredients): void
    {
        $recipe->ingredients()->delete();

        foreach ($ingredients as $index => $ingredient) {
            if (empty($ingredient['inventory_item_id'])) {
                continue;
            }

            $item = InventoryItem::find($ingredient['inventory_item_id']);
            if (!$item) {
                continue;
            }

            $qty = (float) ($ingredient['quantity'] ?? 0);
            $unitCost = (float) ($ingredient['unit_cost'] ?? $item->unit_cost ?? $item->cost_price ?? 0);

            RecipeIngredient::create([
                'recipe_id' => $recipe->id,
                'inventory_item_id' => $ingredient['inventory_item_id'],
                'quantity' => $qty,
                'unit_id' => $ingredient['unit_id'] ?? $item->unit ?? null,
                'unit_cost' => $unitCost,
                'total_cost' => round($qty * $unitCost, 2),
                'is_optional' => (bool) ($ingredient['is_optional'] ?? false),
                'notes' => $ingredient['notes'] ?? null,
                'sort_order' => $ingredient['sort_order'] ?? $index,
            ]);
        }
    }

    /**
     * Recalculate total_cost, profit, and profit margin.
     */
    public function recalculate(Recipe $recipe): Recipe
    {
        $totalCost = (float) $recipe->ingredients()->sum('total_cost');
        $sellingPrice = (float) $recipe->selling_price;

        $profit = $sellingPrice - $totalCost;
        $margin = $sellingPrice > 0 ? round(($profit / $sellingPrice) * 100, 2) : 0;

        $recipe->update([
            'total_cost' => round($totalCost, 2),
            'profit' => round($profit, 2),
            'profit_margin' => $margin,
        ]);

        return $recipe;
    }

    /**
     * Deduct ingredients from stock when the recipe is produced/sold.
     * Only when auto_deduct_stock === 'yes'.
     */
    public function consume(Recipe $recipe, float $multiplier = 1.0, ?int $branchId = null): void
    {
        if ($recipe->auto_deduct_stock !== 'yes') {
            return;
        }

        $restaurantId = getRestaurantId() ?? $recipe->restaurant_id;

        foreach ($recipe->ingredients as $ingredient) {
            $item = $ingredient->inventoryItem;
            if (!$item) {
                continue;
            }
            $qty = (float) $ingredient->quantity * $multiplier;
            if ($qty <= 0) {
                continue;
            }

            $this->stockService->adjustStock(
                $item->id,
                -$qty,
                'consumption',
                $restaurantId,
                $branchId,
                $recipe->id,
                Recipe::class,
                'Recipe consumed: ' . $recipe->name,
                (float) $ingredient->unit_cost
            );
        }
    }

    public function delete(int $id): void
    {
        Recipe::findOrFail($id)->delete();
    }
}
