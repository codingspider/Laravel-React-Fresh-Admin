<?php

namespace Tests\Feature\Menu;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\Menu\Models\ModifierGroup;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class MenuCrudTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
    }

    private function createCategory(array $overrides = []): MenuCategory
    {
        return MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Category ' . uniqid(),
            'status' => 'active',
            ...$overrides,
        ]);
    }

    public function test_menu_category_crud_flow(): void
    {
        $store = $this->postJson('/api/v1/menu/categories', ['name' => 'Burgers'])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Burgers');

        $id = $store->json('data.id');

        $this->getJson("/api/v1/menu/categories/{$id}")->assertOk();

        $this->putJson("/api/v1/menu/categories/{$id}", ['name' => 'Gourmet Burgers'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Gourmet Burgers');

        $this->deleteJson("/api/v1/menu/categories/{$id}")->assertOk();
        $this->assertSoftDeleted('menu_categories', ['id' => $id]);
    }

    public function test_menu_category_requires_name(): void
    {
        $this->postJson('/api/v1/menu/categories', [])->assertStatus(422);
    }

    public function test_cross_restaurant_menu_category_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherCategory = $this->createCategory(['restaurant_id' => $other->id]);

        $this->getJson("/api/v1/menu/categories/{$otherCategory->id}")->assertStatus(403);
        $this->putJson("/api/v1/menu/categories/{$otherCategory->id}", ['name' => 'Hijacked'])->assertStatus(403);
        $this->deleteJson("/api/v1/menu/categories/{$otherCategory->id}")->assertStatus(403);
    }

    public function test_menu_item_crud_flow(): void
    {
        $category = $this->createCategory();

        $store = $this->postJson('/api/v1/menu/items', [
            'menu_category_id' => $category->id,
            'name' => 'Double Cheeseburger',
            'price' => 9.99,
        ])->assertStatus(201);

        $id = $store->json('data.id');
        $this->assertDatabaseHas('menu_items', [
            'id' => $id,
            'restaurant_id' => $this->restaurant->id,
            'menu_category_id' => $category->id,
            'price' => 9.99,
        ]);

        $this->getJson("/api/v1/menu/items/{$id}")->assertOk();

        $this->putJson("/api/v1/menu/items/{$id}", ['price' => 11.50, 'name' => 'Double Cheeseburger'])
            ->assertOk();

        $this->deleteJson("/api/v1/menu/items/{$id}")->assertOk();
        $this->assertSoftDeleted('menu_items', ['id' => $id]);
    }

    public function test_menu_item_requires_category_name_and_price(): void
    {
        $this->postJson('/api/v1/menu/items', ['name' => 'No Price'])->assertStatus(422);
    }

    public function test_cross_restaurant_menu_item_show_update_delete_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherCategory = $this->createCategory(['restaurant_id' => $other->id]);
        $otherItem = MenuItem::create([
            'restaurant_id' => $other->id,
            'menu_category_id' => $otherCategory->id,
            'name' => 'Other Item',
            'price' => 5,
        ]);

        $this->getJson("/api/v1/menu/items/{$otherItem->id}")->assertStatus(403);
        $this->putJson("/api/v1/menu/items/{$otherItem->id}", ['name' => 'Hijacked', 'price' => 1])->assertStatus(403);
        $this->deleteJson("/api/v1/menu/items/{$otherItem->id}")->assertStatus(403);
    }

    public function test_menu_item_upload_image(): void
    {
        $publicPath = storage_path('framework/phase2-public');
        $this->app->usePublicPath($publicPath);

        $category = $this->createCategory();
        $file = UploadedFile::fake()->image('burger.png');

        $this->postJson('/api/v1/menu/items', [
            'menu_category_id' => $category->id,
            'name' => 'With Photo',
            'price' => 7.50,
            'image' => $file,
        ])->assertStatus(201);

        $file = glob($publicPath . '/menu-items/*.png');

        $this->assertNotEmpty($file);

        \Illuminate\Support\Facades\File::deleteDirectory($publicPath);
    }

    public function test_modifier_group_crud_and_cross_restaurant_guard(): void
    {
        $store = $this->postJson('/api/v1/menu/modifier-groups', [
            'name' => 'Extras',
            'is_required' => false,
        ])->assertStatus(201);

        $id = $store->json('data.id');
        $this->assertDatabaseHas('modifier_groups', ['id' => $id, 'restaurant_id' => $this->restaurant->id]);

        $this->putJson("/api/v1/menu/modifier-groups/{$id}", ['name' => 'Add-ons'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Add-ons');

        $other = $this->createRestaurant();
        $otherGroup = ModifierGroup::create([
            'restaurant_id' => $other->id,
            'name' => 'Foreign Group',
        ]);

        $this->getJson("/api/v1/menu/modifier-groups/{$otherGroup->id}")->assertStatus(403);
        $this->putJson("/api/v1/menu/modifier-groups/{$otherGroup->id}", ['name' => 'Hijacked'])->assertStatus(403);
        $this->deleteJson("/api/v1/menu/modifier-groups/{$otherGroup->id}")->assertStatus(403);

        $this->deleteJson("/api/v1/menu/modifier-groups/{$id}")->assertOk();
        $this->assertSoftDeleted('modifier_groups', ['id' => $id]);
    }

    public function test_menu_item_can_be_assigned_to_branch(): void
    {
        $category = $this->createCategory();
        $item = MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'menu_category_id' => $category->id,
            'name' => 'Assignable',
            'price' => 3,
        ]);
        $branch = $this->createBranch($this->restaurant);

        $this->postJson('/api/v1/menu/items/assign-branch', [
            'item_ids' => [$item->id],
            'branch_id' => $branch->id,
        ])->assertOk()
            ->assertJsonPath('data.count', 1);

        $this->assertDatabaseHas('menu_items', [
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $branch->id,
            'name' => 'Assignable',
        ]);
    }
}