<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryCategory as AppInventoryCategory;
use App\Models\InventoryItem;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class InventoryCrudTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
        $this->createBranch($this->restaurant);
    }

    public function test_inventory_category_crud_and_guard(): void
    {
        $created = $this->postJson('/api/inventory-categories', ['name' => 'Produce'])
            ->assertStatus(201);

        $id = $created->json('data.id');
        $this->assertDatabaseHas('inventory_categories', ['id' => $id, 'restaurant_id' => $this->restaurant->id]);

        $this->putJson("/api/inventory-categories/{$id}", ['name' => 'Fresh Produce'])->assertOk();
        $this->deleteJson("/api/inventory-categories/{$id}")->assertOk();
        $this->assertSoftDeleted('inventory_categories', ['id' => $id]);

        $other = $this->createRestaurant();
        $otherCategory = AppInventoryCategory::create(['restaurant_id' => $other->id, 'name' => 'Foreign']);

        $this->getJson("/api/inventory-categories/{$otherCategory->id}")->assertStatus(403);
    }

    public function test_unit_crud_and_guard(): void
    {
        $created = $this->postJson('/api/units', ['actual_name' => 'Kilogram', 'short_name' => 'kg'])
            ->assertStatus(201);

        $id = $created->json('data.id');

        $this->putJson("/api/units/{$id}", ['actual_name' => 'Kilograms'])->assertOk();
        $this->getJson("/api/units/{$id}")->assertOk();
        $this->deleteJson("/api/units/{$id}")->assertOk();
        $this->assertSoftDeleted('units', ['id' => $id]);

        $other = $this->createRestaurant();
        $otherUnit = Unit::create(['restaurant_id' => $other->id, 'actual_name' => 'Each', 'short_name' => 'ea']);

        $this->getJson("/api/units/{$otherUnit->id}")->assertStatus(403);
        $this->putJson("/api/units/{$otherUnit->id}", ['actual_name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/units/{$otherUnit->id}")->assertStatus(403);
    }

    private function createItem(array $overrides = []): int
    {
        return $this->postJson('/api/inventory-items', array_merge([
            'name' => 'Tomato',
            'is_active' => true,
        ], $overrides))->assertStatus(201)->json('data.id');
    }

    public function test_inventory_item_crud_lists_scoped_to_restaurant(): void
    {
        $id = $this->createItem(['name' => 'Tomato', 'quantity' => 10]);

        $this->assertDatabaseHas('inventory_items', [
            'id' => $id,
            'restaurant_id' => $this->restaurant->id,
            'status' => 'active',
        ]);

        $this->getJson("/api/inventory-items/{$id}")->assertOk();

        $index = $this->getJson('/api/inventory-items?search=Tomato')->assertOk();
        $this->assertNotEmpty($index->json('data.data'));

        $this->putJson("/api/inventory-items/{$id}", ['name' => 'Roma Tomato'])->assertOk();
        $this->deleteJson("/api/inventory-items/{$id}")->assertOk();
        $this->assertSoftDeleted('inventory_items', ['id' => $id]);
    }

    public function test_inventory_item_requires_name_and_is_active(): void
    {
        $this->postJson('/api/inventory-items', ['name' => 'No State'])->assertStatus(422);
    }

    public function test_cross_restaurant_inventory_item_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherItem = InventoryItem::create(['restaurant_id' => $other->id, 'name' => 'Foreign Item']);

        $this->getJson("/api/inventory-items/{$otherItem->id}")->assertStatus(403);
        $this->putJson("/api/inventory-items/{$otherItem->id}", ['name' => 'Hijacked'])->assertStatus(403);
        $this->deleteJson("/api/inventory-items/{$otherItem->id}")->assertStatus(403);
    }

    public function test_list_does_not_expose_other_restaurant_items(): void
    {
        $other = $this->createRestaurant();
        InventoryItem::create(['restaurant_id' => $other->id, 'name' => 'Secret Crate']);

        $data = $this->getJson('/api/inventory-items')->assertOk()->json('data.data');
        $this->assertEmpty(array_filter($data, fn ($i) => $i['restaurant_id'] === $other->id));
    }
}