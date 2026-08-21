<?php

namespace Tests\Feature\Purchase;

use App\Models\GoodsReceivedNote;
use App\Models\Purchase;
use App\Models\SupplierTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class PurchaseFlowTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private int $supplierId;
    private int $itemId;
    private int $branchId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
        $this->branchId = $this->createBranch($this->restaurant)->id;

        $this->supplierId = $this->postJson('/api/suppliers', [
            'name' => 'Frozen Foods Inc',
            'phone' => '0998877665',
        ])->assertStatus(201)->json('data.id');

        $this->itemId = $this->postJson('/api/inventory-items', [
            'name' => 'Frozen Chicken',
            'is_active' => true,
        ])->assertStatus(201)->json('data.id');
    }

    private function purchasePayload(array $overrides = []): array
    {
        return array_merge([
            'supplier_id' => $this->supplierId,
            'branch_id' => $this->branchId,
            'order_type' => 'direct_purchase',
            'items' => [
                [
                    'inventory_item_id' => $this->itemId,
                    'quantity' => 5,
                    'unit_price' => 10,
                    'tax_rate' => 10,
                ],
            ],
        ], $overrides);
    }

    private function createPurchase(array $overrides = []): array
    {
        return $this->postJson('/api/purchases', $this->purchasePayload($overrides))
            ->assertStatus(201)
            ->json('data');
    }

    public function test_purchase_lifecycle_create_receive_pay_return(): void
    {
        $purchase = $this->createPurchase();

        $this->assertDatabaseHas('purchases', [
            'id' => $purchase['id'],
            'restaurant_id' => $this->restaurant->id,
            'subtotal' => 50,
            'tax_amount' => 5,
            'total' => 55,
            'paid_amount' => 0,
            'due_amount' => 55,
        ]);

        $this->assertDatabaseHas('purchase_items', [
            'purchase_id' => $purchase['id'],
            'inventory_item_id' => $this->itemId,
            'quantity' => 5,
            'unit_price' => 10,
        ]);

        $this->assertDatabaseHas('supplier_transactions', [
            'supplier_id' => $this->supplierId,
            'type' => 'purchase',
            'debit' => 55,
            'balance' => 55,
        ]);

        // Receive goods → stock increases, batch tracked.
        $itemRow = $purchase['items'][0];
        $this->postJson("/api/purchases/{$purchase['id']}/receive-goods", [
            'status' => 'completed',
            'items' => [
                [
                    'purchase_item_id' => $itemRow['id'],
                    'received_quantity' => 5,
                    'unit_cost' => 10,
                    'batch_number' => 'B-101',
                    'expiry_date' => '2026-12-31',
                ],
            ],
        ])->assertStatus(201);

        $this->assertDatabaseHas('inventory_items', [
            'id' => $this->itemId,
            'current_stock' => 5,
        ]);
        $this->assertDatabaseHas('inventory_batches', [
            'item_id' => $this->itemId,
            'batch_number' => 'B-101',
            'remaining_qty' => 5,
        ]);
        $this->assertDatabaseHas('goods_received_notes', [
            'purchase_id' => $purchase['id'],
            'total_received' => 5,
            'total_amount' => 50,
        ]);

        // Pay in full → due cleared, payment ledger posted.
        $this->postJson("/api/purchases/{$purchase['id']}/payments", [
            'amount' => 55,
            'payment_method' => 'bank_transfer',
            'status' => 'completed',
        ])->assertStatus(201);

        $this->assertDatabaseHas('purchases', ['id' => $purchase['id'], 'paid_amount' => 55, 'due_amount' => 0]);
        $this->assertDatabaseHas('supplier_transactions', [
            'supplier_id' => $this->supplierId,
            'type' => 'payment',
            'credit' => 55,
            'balance' => 0,
        ]);

        // Return goods → stock restored, debit note posted.
        $this->postJson("/api/purchases/{$purchase['id']}/returns", [
            'type' => 'return',
            'reason' => 'damaged',
            'items' => [
                [
                    'inventory_item_id' => $this->itemId,
                    'quantity' => 5,
                    'unit_cost' => 10,
                ],
            ],
        ])->assertStatus(201);

        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 0]);
        $this->assertDatabaseHas('purchase_returns', [
            'purchase_id' => $purchase['id'],
            'total' => 50,
        ]);
        $this->assertDatabaseHas('supplier_transactions', [
            'supplier_id' => $this->supplierId,
            'type' => 'return',
            'credit' => 50,
        ]);

        $this->deleteJson("/api/purchases/{$purchase['id']}")->assertOk();
        $this->assertSoftDeleted('purchases', ['id' => $purchase['id']]);
    }

    public function test_purchase_requires_supplier_items_and_valid_quantities(): void
    {
        $this->postJson('/api/purchases', ['supplier_id' => $this->supplierId])->assertStatus(422);
        $this->postJson('/api/purchases', ['supplier_id' => $this->supplierId, 'items' => []])->assertStatus(422);
    }

    public function test_purchase_list_filters_and_scoping(): void
    {
        $this->createPurchase();

        $other = $this->createRestaurant();
        Purchase::create([
            'restaurant_id' => $other->id,
            'reference_number' => 'PO-OTH',
            'name' => 'Other purchase',
            'total' => 0,
        ]);
        Purchase::create([
            'restaurant_id' => $this->restaurant->id,
            'reference_number' => 'PO-LOCAL',
            'name' => 'Local purchase',
            'total' => 0,
        ]);

        $response = $this->getJson('/api/purchases')->assertOk();
        $ids = array_column($response->json('data.data'), 'id');

        $this->assertNotContains(Purchase::where('reference_number', 'PO-OTH')->first()->id, $ids);
    }

    public function test_cross_restaurant_purchase_actions_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherPurchase = Purchase::create([
            'restaurant_id' => $other->id,
            'reference_number' => 'PO-X',
            'name' => 'Foreign purchase',
            'total' => 0,
        ]);

        $this->getJson("/api/purchases/{$otherPurchase->id}")->assertStatus(403);
        $this->putJson("/api/purchases/{$otherPurchase->id}", $this->purchasePayload())
            ->assertStatus(403);
        $this->deleteJson("/api/purchases/{$otherPurchase->id}")->assertStatus(403);
        $this->postJson("/api/purchases/{$otherPurchase->id}/receive-goods", ['items' => []])
            ->assertStatus(403);
        $this->postJson("/api/purchases/{$otherPurchase->id}/payments", ['amount' => 1])
            ->assertStatus(403);
        $this->postJson("/api/purchases/{$otherPurchase->id}/returns", ['items' => []])
            ->assertStatus(403);
    }
}