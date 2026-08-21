<?php

namespace Tests\Feature\POS;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\POS\Models\Sale;
use Modules\Restaurant\Models\Restaurant;
use Modules\TableManagement\Models\Floor;
use Modules\TableManagement\Models\Table;
use Tests\TestCase;

class PosFlowTest extends TestCase
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
    }

    private function placeSale(array $overrides = []): array
    {
        $response = $this->postJson('/api/v1/pos', array_merge([
            'order_type' => 'dine_in',
            'items' => [
                ['menu_item_id' => $this->itemId, 'quantity' => 2, 'unit_price' => 10],
            ],
        ], $overrides))->assertStatus(201);

        return $response->json('data');
    }

    public function test_pos_settings_roundtrip(): void
    {
        $this->getJson('/api/v1/pos/settings')->assertOk();

        $enabled = $this->putJson('/api/v1/pos/settings', ['enable_tip' => false, 'enable_discount' => true])
            ->assertOk()
            ->json('data');

        $this->assertFalse($enabled['enable_tip']);
        $this->assertTrue($enabled['enable_discount']);
    }

    public function test_coupon_crud_and_validation(): void
    {
        $coupon = $this->postJson('/api/v1/pos/coupons', [
            'code' => 'SAVE5',
            'type' => 'fixed',
            'value' => 5,
            'min_order_amount' => 20,
        ])->assertStatus(201)
            ->json('data');

        $this->assertDatabaseHas('coupons', [
            'id' => $coupon['id'],
            'restaurant_id' => $this->restaurant->id,
            'code' => 'SAVE5',
            'used_count' => 0,
        ]);

        $valid = $this->postJson('/api/v1/pos/coupons/validate', [
            'code' => 'SAVE5',
            'order_amount' => 50,
        ])->assertOk();

        $this->assertTrue($valid->json('data.valid'));
        $this->assertEquals(5.0, (float) $valid->json('data.discount'));

        $this->postJson('/api/v1/pos/coupons', [
            'code' => 'SAVE5',
            'type' => 'fixed',
            'value' => 5,
        ])->assertStatus(422);

        $this->postJson('/api/v1/pos/coupons/validate', [
            'code' => 'NOPE',
            'order_amount' => 50,
        ])->assertStatus(422);

        $this->deleteJson("/api/v1/pos/coupons/{$coupon['id']}")->assertOk();
        $this->assertSoftDeleted('coupons', ['id' => $coupon['id']]);
    }

    public function test_cross_restaurant_coupon_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherCoupon = \Modules\POS\Models\Coupon::create([
            'restaurant_id' => $other->id,
            'code' => 'OTHER',
            'type' => 'fixed',
            'value' => 3,
        ]);

        $this->getJson("/api/v1/pos/coupons/{$otherCoupon->id}")->assertStatus(403);
        $this->putJson("/api/v1/pos/coupons/{$otherCoupon->id}", ['code' => 'OTHERX', 'type' => 'fixed', 'value' => 10])->assertStatus(403);
        $this->deleteJson("/api/v1/pos/coupons/{$otherCoupon->id}")->assertStatus(403);
    }

    public function test_pos_session_open_and_close(): void
    {
        $branch = $this->createBranch($this->restaurant);

        $session = $this->postJson('/api/v1/pos/sessions/start', [
            'branch_id' => $branch->id,
            'opening_balance' => 500,
        ])->assertStatus(201)
            ->json('data');

        $this->assertEquals('open', $session['status']);

        $open = $this->getJson('/api/v1/pos/sessions/open?branch_id=' . $branch->id)
            ->assertOk()
            ->json('data');

        $this->assertEquals($session['id'], $open['id']);

        $closed = $this->postJson("/api/v1/pos/sessions/{$session['id']}/close", [
            'closing_balance' => 600,
            'notes' => 'end of day',
        ])->assertOk()
            ->json('data');

        $this->assertEquals('closed', $closed['status']);
        $this->assertEquals(500.0, (float) $closed['expected_balance']);
        $this->assertEquals(100.0, (float) $closed['difference']);
    }

    public function test_sale_created_with_pricing_recalculated(): void
    {
        $sale = $this->placeSale(['tax_rate' => 5]);

        $this->assertEquals('pending', $sale['status']);
        $this->assertEquals('unpaid', $sale['payment_status']);
        $this->assertEquals('dine_in', $sale['order_type']);
        $this->assertEquals(20.0, (float) $sale['subtotal']);
        $this->assertEquals(1.0, (float) $sale['tax_amount']);
        $this->assertEquals(21.0, (float) $sale['total']);

        $this->assertDatabaseHas('sales', [
            'id' => $sale['id'],
            'invoice_number' => $sale['invoice_number'],
            'restaurant_id' => $this->restaurant->id,
            'status' => 'pending',
        ]);
    }

    public function test_sale_discount_percent_and_validation(): void
    {
        $this->postJson('/api/v1/pos', [
            'order_type' => 'takeaway',
            'items' => [],
        ])->assertStatus(422);

        $sale = $this->placeSale([
            'order_type' => 'takeaway',
            'discount_type' => 'percent',
            'discount_value' => 10,
        ]);

        $this->assertEquals(2.0, (float) $sale['discount_amount']);
        $this->assertEquals(10, (float) $sale['discount_percent']);
        $this->assertEquals(18.0, (float) $sale['total']);
    }

    public function test_add_and_remove_sale_item(): void
    {
        $sale = $this->placeSale();
        $id = $sale['id'];

        $afterAdd = $this->postJson("/api/v1/pos/{$id}/items", [
            'menu_item_id' => $this->itemId,
            'quantity' => 1,
            'unit_price' => 10,
        ])->assertOk()
            ->json('data');

        $this->assertEquals(30.0, (float) $afterAdd['subtotal']);
        $this->assertCount(2, $afterAdd['items']);

        $itemId = $afterAdd['items'][1]['id'];
        $afterRemove = $this->deleteJson("/api/v1/pos/{$id}/items/{$itemId}")
            ->assertOk()
            ->json('data');

        $this->assertEquals(20.0, (float) $afterRemove['subtotal']);
        $this->assertCount(1, $afterRemove['items']);
    }

    public function test_hold_recall_cancel_and_held_orders(): void
    {
        $sale = $this->placeSale();
        $id = $sale['id'];

        $held = $this->getJson('/api/v1/pos/held')->assertOk()->json('data');
        $this->assertNotEmpty($held);

        $this->postJson("/api/v1/pos/{$id}/recall")->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->getJson('/api/v1/pos/held')->assertOk()->assertJsonCount(0, 'data');

        $this->postJson("/api/v1/pos/{$id}/cancel")->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_payment_lifecycle_and_table_status(): void
    {
        $floor = Floor::create(['restaurant_id' => $this->restaurant->id, 'name' => 'Main', 'status' => 'active']);
        $table = Table::create(['restaurant_id' => $this->restaurant->id, 'floor_id' => $floor->id, 'name' => 'T1', 'capacity' => 4, 'status' => 'available']);

        $sale = $this->placeSale(['table_id' => $table->id]);
        $id = $sale['id'];

        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'occupied']);

        $paid = $this->postJson("/api/v1/pos/{$id}/payments", [
            'payment_method' => 'cash',
            'amount' => 20,
        ])->assertOk()
            ->json('data');

        $this->assertEquals('completed', $paid['status']);
        $this->assertEquals('paid', $paid['payment_status']);
        $this->assertEquals(20.0, (float) $paid['amount_paid']);
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'available']);

        $refunded = $this->postJson("/api/v1/pos/{$id}/refund", [
            'amount' => 20,
            'payment_method' => 'cash',
            'refund_reason' => 'test',
        ])->assertOk()
            ->json('data');

        $this->assertEquals('refunded', $refunded['status']);
        $this->assertEquals('refunded', $refunded['payment_status']);
    }

    public function test_partial_and_multiple_payments(): void
    {
        $sale = $this->placeSale();
        $id = $sale['id'];

        $partial = $this->postJson("/api/v1/pos/{$id}/payments", [
            'payment_method' => 'card',
            'amount' => 8,
        ])->assertOk()
            ->json('data');

        $this->assertEquals('partial', $partial['payment_status']);
        $this->assertEquals('pending', $partial['status']);

        $multiple = $this->postJson("/api/v1/pos/{$id}/payments/multiple", [
            'payments' => [
                ['payment_method' => 'cash', 'amount' => 12],
            ],
        ])->assertOk()
            ->json('data');

        $this->assertEquals('paid', $multiple['payment_status']);
        $this->assertEquals('completed', $multiple['status']);
    }

    public function test_merge_bills_and_single_sale_rejected(): void
    {
        $first = $this->placeSale();
        $second = $this->placeSale();

        $merged = $this->postJson('/api/v1/pos/merge', [
            'sale_ids' => [$first['id'], $second['id']],
        ])->assertOk()
            ->json('data');

        $this->assertEquals($first['id'], $merged['id']);
        $this->assertEquals(40.0, (float) $merged['subtotal']);
        $this->assertSoftDeleted('sales', ['id' => $second['id']]);

        $third = $this->placeSale();
        $this->postJson('/api/v1/pos/merge', ['sale_ids' => [$third['id']]])
            ->assertStatus(422);
    }

    public function test_cross_restaurant_sale_actions_are_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherSale = Sale::create([
            'restaurant_id' => $other->id,
            'user_id' => auth()->id(),
            'invoice_number' => Sale::generateInvoiceNumber($other->id),
            'order_type' => 'dine_in',
            'status' => 'pending',
        ]);

        $this->getJson("/api/v1/pos/{$otherSale->id}")->assertStatus(403);
        $this->postJson("/api/v1/pos/{$otherSale->id}/payments", [
            'payment_method' => 'cash',
            'amount' => 10,
        ])->assertStatus(403);
        $this->postJson("/api/v1/pos/{$otherSale->id}/hold")->assertStatus(403);
        $this->postJson("/api/v1/pos/{$otherSale->id}/cancel")->assertStatus(403);
        $this->postJson("/api/v1/pos/{$otherSale->id}/items", [
            'menu_item_id' => $this->itemId,
            'quantity' => 1,
        ])->assertStatus(403);
    }

    public function test_cross_restaurant_session_close_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherBranch = $this->createBranch($other);
        $otherSession = \Modules\POS\Models\PosSession::create([
            'restaurant_id' => $other->id,
            'branch_id' => $otherBranch->id,
            'user_id' => auth()->id(),
            'opening_balance' => 0,
            'status' => 'open',
        ]);

        $this->postJson("/api/v1/pos/sessions/{$otherSession->id}/close", [
            'closing_balance' => 10,
        ])->assertStatus(403);
    }
}