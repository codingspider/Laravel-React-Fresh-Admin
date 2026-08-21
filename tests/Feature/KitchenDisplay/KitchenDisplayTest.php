<?php

namespace Tests\Feature\KitchenDisplay;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class KitchenDisplayTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private int $itemId;

    protected function setUp(): void
    {
        parent::setUp();

        Event::fake();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
        $this->createBranch($this->restaurant);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Burgers',
            'status' => 'active',
        ]);

        $item = MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'menu_category_id' => $category->id,
            'name' => 'Cheeseburger',
            'price' => 10,
            'status' => 'active',
        ]);

        $this->itemId = $item->id;

        config([
            'kitchendisplay.statuses' => [
                'new' => ['pending', 'confirmed'],
                'preparing' => ['preparing'],
                'ready' => ['ready'],
            ],
            'kitchendisplay.delay_threshold_minutes' => 15,
        ]);
    }

    private function createKitchenSale(): int
    {
        $sale = $this->postJson('/api/v1/pos', [
            'order_type' => 'dine_in',
            'items' => [
                ['menu_item_id' => $this->itemId, 'quantity' => 1, 'unit_price' => 10],
            ],
        ])->assertStatus(201)->json('data');

        return $sale['id'];
    }

    public function test_board_lists_kitchen_orders(): void
    {
        $id = $this->createKitchenSale();

        $board = $this->getJson('/api/v1/kitchen/display')->assertOk()->json('data');

        $newIds = array_column($board['columns']['new'] ?? [], 'id');
        $this->assertContains($id, $newIds);
        $this->assertArrayHasKey('stats', $board);
        $this->assertArrayHasKey('generated_at', $board);
    }

    public function test_status_transitions_update_sale_and_timestamps(): void
    {
        $id = $this->createKitchenSale();

        $this->postJson("/api/v1/kitchen/orders/{$id}/status", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->postJson("/api/v1/kitchen/orders/{$id}/status", ['status' => 'preparing'])
            ->assertOk()
            ->assertJsonPath('data.status', 'preparing');

        $this->assertNotNull(\Modules\POS\Models\Sale::find($id)->started_at);

        $this->postJson("/api/v1/kitchen/orders/{$id}/status", ['status' => 'ready'])
            ->assertOk()
            ->assertJsonPath('data.status', 'ready');

        $this->assertNotNull(\Modules\POS\Models\Sale::find($id)->ready_at);

        $this->postJson("/api/v1/kitchen/orders/{$id}/status", ['status' => 'served'])
            ->assertOk()
            ->assertJsonPath('data.status', 'served');
    }

    public function test_invalid_status_and_priority_are_rejected(): void
    {
        $id = $this->createKitchenSale();

        $this->postJson("/api/v1/kitchen/orders/{$id}/status", ['status' => 'bogus'])->assertStatus(422);
        $this->postJson("/api/v1/kitchen/orders/{$id}/priority", ['priority' => 'bogus'])->assertStatus(422);
    }

    public function test_set_priority_and_assign_chef(): void
    {
        $id = $this->createKitchenSale();

        $this->postJson("/api/v1/kitchen/orders/{$id}/priority", ['priority' => 'urgent'])
            ->assertOk()
            ->assertJsonPath('data.priority', 'urgent');

        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'chef', 'guard_name' => 'web']);
        $chef = User::factory()->create(['restaurant_id' => $this->restaurant->id]);
        $chef->assignRole('chef');

        $this->postJson("/api/v1/kitchen/orders/{$id}/chef", ['chef_user_id' => $chef->id])
            ->assertOk()
            ->assertJsonPath('data.chef_user_id', $chef->id);

        $chefs = $this->getJson('/api/v1/kitchen/chefs')->assertOk()->json('data');
        $this->assertContains($chef->id, array_column($chefs, 'id'));
    }

    public function test_branch_user_without_permission_is_denied(): void
    {
        $branch = $this->createBranch($this->restaurant);
        $user = User::factory()->forBranch($branch)->create();
        \Laravel\Sanctum\Sanctum::actingAs($user);

        $this->getJson('/api/v1/kitchen/display')->assertStatus(403);
        $this->postJson('/api/v1/kitchen/orders/1/status', ['status' => 'confirmed'])->assertStatus(403);
    }

    public function test_cross_restaurant_kitchen_order_is_not_found(): void
    {
        $other = $this->createRestaurant();
        $sale = \Modules\POS\Models\Sale::create([
            'restaurant_id' => $other->id,
            'user_id' => auth()->id(),
            'invoice_number' => \Modules\POS\Models\Sale::generateInvoiceNumber($other->id),
            'order_type' => 'dine_in',
            'status' => 'pending',
        ]);

        $this->postJson("/api/v1/kitchen/orders/{$sale->id}/status", ['status' => 'confirmed'])->assertStatus(404);
    }
}