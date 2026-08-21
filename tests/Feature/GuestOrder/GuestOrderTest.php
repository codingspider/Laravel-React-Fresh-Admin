<?php

namespace Tests\Feature\GuestOrder;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\Restaurant\Models\Restaurant;
use Modules\TableManagement\Models\Floor;
use Modules\TableManagement\Models\Table;
use Tests\TestCase;

class GuestOrderTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private int $itemId;

    protected function setUp(): void
    {
        parent::setUp();

        // GuestOrderService hardcodes user_id = 1 for the anonymous guest.
        User::factory()->create(['id' => 1]);

        $this->restaurant = $this->createRestaurant();
        $this->createBranch($this->restaurant);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
            'status' => 'active',
        ]);

        $item = MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'menu_category_id' => $category->id,
            'name' => 'Cola',
            'price' => 2.5,
            'status' => 'active',
        ]);

        $this->itemId = $item->id;
    }

    private function createTable(): Table
    {
        $floor = Floor::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Ground',
            'status' => 'active',
        ]);

        return Table::create([
            'restaurant_id' => $this->restaurant->id,
            'floor_id' => $floor->id,
            'name' => 'T1',
            'capacity' => 4,
            'status' => 'available',
        ]);
    }

    public function test_table_resolved_by_qr_token(): void
    {
        $table = $this->createTable();

        $data = $this->getJson("/api/guest/table/{$table->qr_token}")
            ->assertOk()
            ->json('data');

        $this->assertEquals($table->id, $data['table_id']);
        $this->assertEquals($this->restaurant->id, $data['restaurant_id']);
        $this->assertTrue($data['qr_ordering']['enabled']);

        $this->getJson('/api/guest/table/nonexistent-token')->assertStatus(404);
    }

    public function test_menu_requires_restaurant_and_returns_active_items(): void
    {
        $this->getJson('/api/guest/menu')->assertStatus(422);

        $menu = $this->getJson('/api/guest/menu?restaurant_id=' . $this->restaurant->id)
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $menu);
        $this->assertEquals('Drinks', $menu[0]['name']);
        $this->assertEquals('Cola', $menu[0]['items'][0]['name']);
    }

    public function test_guest_can_place_and_track_order(): void
    {
        $table = $this->createTable();

        $order = $this->postJson('/api/guest/order', [
            'restaurant_id' => $this->restaurant->id,
            'table_id' => $table->id,
            'guest_name' => 'Guest One',
            'items' => [
                [
                    'menu_item_id' => $this->itemId,
                    'item_name' => 'Cola',
                    'quantity' => 2,
                    'unit_price' => 2.5,
                ],
            ],
        ])->assertStatus(201)
            ->json('data');

        $this->assertNotEmpty($order['invoice_number']);
        $this->assertEquals('pending', $order['status']);

        $this->assertDatabaseHas('sales', [
            'invoice_number' => $order['invoice_number'],
            'restaurant_id' => $this->restaurant->id,
            'source' => 'qr',
            'order_type' => 'dine_in',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'total' => 5.0,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'sale_id' => \Modules\POS\Models\Sale::where('invoice_number', $order['invoice_number'])->value('id'),
            'item_name' => 'Cola',
            'quantity' => 2,
        ]);

        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'occupied']);

        $tracked = $this->getJson("/api/guest/order/{$order['invoice_number']}")
            ->assertOk()
            ->json('data');

        $this->assertEquals($order['invoice_number'], $tracked['invoice_number']);

        $this->getJson('/api/guest/order/NOPE-404')->assertStatus(404);
    }

    public function test_table_returns_404_when_order_placed_on_unknown_table_id(): void
    {
        $this->postJson('/api/guest/order', [
            'restaurant_id' => $this->restaurant->id,
            'table_id' => 999999,
            'items' => [
                ['menu_item_id' => $this->itemId, 'item_name' => 'Cola', 'quantity' => 1, 'unit_price' => 2.5],
            ],
        ])->assertStatus(422);
    }
}