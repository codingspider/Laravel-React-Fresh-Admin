<?php

namespace Tests\Feature\Recipe;

use App\Models\Recipe;
use App\Models\RecipeCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class RecipeCrudTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private int $recipeCategoryId;
    private int $unitId;
    private int $inventoryItemId;
    private int $menuItemId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
        $this->createBranch($this->restaurant);

        $this->recipeCategoryId = $this->postJson('/api/recipe-categories', ['name' => 'Mains'])
            ->assertStatus(201)->json('data.id');

        $this->unitId = $this->postJson('/api/units', ['actual_name' => 'Gram', 'short_name' => 'g'])
            ->assertStatus(201)->json('data.id');

        $this->inventoryItemId = $this->postJson('/api/inventory-items', [
            'name' => 'Ground Beef',
            'is_active' => true,
        ])->assertStatus(201)->json('data.id');

        $menuCategory = MenuCategory::create(['restaurant_id' => $this->restaurant->id, 'name' => 'Burgers', 'status' => 'active']);
        $this->menuItemId = MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'menu_category_id' => $menuCategory->id,
            'name' => 'Beef Burger',
            'price' => 12,
            'status' => 'active',
        ])->id;
    }

    private function recipePayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Beef Burger Recipe',
            'category_id' => $this->recipeCategoryId,
            'menu_item_id' => $this->menuItemId,
            'yield_quantity' => 1,
            'yield_unit_id' => $this->unitId,
            'auto_deduct_stock' => 'no',
            'status' => 'active',
            'ingredients' => [
                [
                    'inventory_item_id' => $this->inventoryItemId,
                    'quantity' => 0.5,
                    'unit_id' => $this->unitId,
                    'unit_cost' => 2,
                ],
            ],
        ], $overrides);
    }

    public function test_recipe_crud_persists_ingredients(): void
    {
        $created = $this->postJson('/api/recipes', $this->recipePayload())
            ->assertStatus(201);

        $recipe = $created->json('data');
        $this->assertDatabaseHas('recipes', [
            'id' => $recipe['id'],
            'restaurant_id' => $this->restaurant->id,
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('recipe_ingredients', [
            'recipe_id' => $recipe['id'],
            'inventory_item_id' => $this->inventoryItemId,
            'quantity' => 0.5,
            'unit_id' => $this->unitId,
        ]);

        $this->getJson("/api/recipes/{$recipe['id']}")->assertOk();

        $this->putJson("/api/recipes/{$recipe['id']}", [
            'name' => 'Signature Beef Burger',
            'ingredients' => [
                [
                    'inventory_item_id' => $this->inventoryItemId,
                    'quantity' => 0.75,
                    'unit_id' => $this->unitId,
                    'unit_cost' => 2,
                ],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('recipes', ['id' => $recipe['id'], 'name' => 'Signature Beef Burger']);
        $this->assertDatabaseHas('recipe_ingredients', [
            'recipe_id' => $recipe['id'],
            'quantity' => 0.75,
        ]);

        $this->deleteJson("/api/recipes/{$recipe['id']}")->assertOk();
        $this->assertSoftDeleted('recipes', ['id' => $recipe['id']]);
    }

    public function test_recipe_requires_category_menu_item_and_ingredients(): void
    {
        $this->postJson('/api/recipes', ['name' => 'Incomplete'])->assertStatus(422);
    }

    public function test_options_entrypoint_returns_selected_data(): void
    {
        $options = $this->getJson('/api/recipe/options')->assertOk()->json('data');

        $this->assertContains($this->recipeCategoryId, array_column($options['categories'], 'id'));
        $this->assertContains($this->unitId, array_column($options['units'], 'id'));
        $this->assertContains($this->inventoryItemId, array_column($options['inventory_items'], 'id'));
        $this->assertContains($this->menuItemId, array_column($options['menu_items'], 'id'));
    }

    public function test_recipe_category_guard(): void
    {
        $other = $this->createRestaurant();
        $otherCategory = RecipeCategory::create(['restaurant_id' => $other->id, 'name' => 'Foreign']);

        $this->getJson("/api/recipe-categories/{$otherCategory->id}")->assertStatus(403);
        $this->deleteJson("/api/recipe-categories/{$otherCategory->id}")->assertStatus(403);
    }

    public function test_cross_restaurant_recipe_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherRecipe = Recipe::create(['restaurant_id' => $other->id, 'name' => 'Foreign Recipe']);

        $this->getJson("/api/recipes/{$otherRecipe->id}")->assertStatus(403);
        $this->putJson("/api/recipes/{$otherRecipe->id}", ['name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/recipes/{$otherRecipe->id}")->assertStatus(403);
    }
}