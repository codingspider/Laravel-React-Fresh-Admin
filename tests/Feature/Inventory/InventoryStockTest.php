<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryAdjustment;
use App\Models\InventoryItem;
use App\Models\InventoryTransfer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class InventoryStockTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private int $itemId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
        $this->createBranch($this->restaurant);

        $this->itemId = $this->createItem();
    }

    private function createItem(): int
    {
        return $this->postJson('/api/inventory-items', [
            'name' => 'Flour',
            'is_active' => true,
        ])->assertStatus(201)->json('data.id');
    }

    private function addStock(float $qty, string $type = 'purchase'): void
    {
        $this->postJson("/api/inventory/items/{$this->itemId}/adjust-stock", [
            'quantity' => $qty,
            'type' => $type,
            'unit_cost' => 2,
        ])->assertOk();
    }

    public function test_overview_lists_items_with_valuation(): void
    {
        $this->addStock(10);

        $response = $this->getJson('/api/inventory/overview')->assertOk();

        $ids = array_column($response->json('data.data'), 'id');
        $this->assertContains($this->itemId, $ids);
        $this->assertArrayHasKey('total_stock_value', $response->json('summary'));
        $this->assertArrayHasKey('low_stock_items', $response->json('summary'));
    }

    public function test_adjust_stock_updates_item_and_records_transaction(): void
    {
        $this->addStock(10, 'purchase');

        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 10.0]);
        $this->assertDatabaseHas('inventory_transactions', [
            'item_id' => $this->itemId,
            'type' => 'purchase',
            'quantity' => 10.0,
            'new_stock' => 10.0,
        ]);

        $this->postJson("/api/inventory/items/{$this->itemId}/adjust-stock", [
            'quantity' => -4,
            'type' => 'consumption',
            'notes' => 'kitchen use',
        ])->assertOk();

        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 6.0]);
    }

    public function test_transfer_flow_moves_stock_between_branches(): void
    {
        $this->addStock(10);

        $branchA = $this->createBranch($this->restaurant);
        $branchB = $this->createBranch($this->restaurant);

        $transfer = $this->postJson('/api/inventory/transfers', [
            'from_branch_id' => $branchA->id,
            'to_branch_id' => $branchB->id,
            'items' => [
                ['item_id' => $this->itemId, 'quantity' => 3],
            ],
        ])->assertStatus(201);

        $id = $transfer->json('data.id');
        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 7.0]);

        $this->postJson("/api/inventory/transfers/{$id}/receive", [
            'items' => [
                ['item_id' => $this->itemId, 'received_quantity' => 3],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('inventory_transfers', ['id' => $id, 'status' => 'received']);
        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 10.0]);
    }

    public function test_transfer_requires_different_branches(): void
    {
        $branch = $this->createBranch($this->restaurant);

        $this->postJson('/api/inventory/transfers', [
            'from_branch_id' => $branch->id,
            'to_branch_id' => $branch->id,
            'items' => [['item_id' => $this->itemId, 'quantity' => 1]],
        ])->assertStatus(422);
    }

    public function test_waste_reduces_stock(): void
    {
        $this->addStock(10);

        $this->postJson('/api/inventory/wastes', [
            'type' => 'damage',
            'reason' => 'spilled',
            'items' => [
                ['item_id' => $this->itemId, 'quantity' => 2, 'unit_cost' => 2],
            ],
        ])->assertStatus(201);

        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 8.0]);
        $this->assertDatabaseHas('inventory_wastes', ['type' => 'damage']);
    }

    public function test_adjustment_flow_applies_stock_on_approval(): void
    {
        $this->addStock(8);

        $approved = $this->postJson('/api/inventory/adjustments', [
            'type' => 'stock_take',
            'status' => 'approved',
            'items' => [
                ['item_id' => $this->itemId, 'actual_stock' => 5],
            ],
        ])->assertStatus(201);

        $approvedId = $approved->json('data.id');
        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 5.0]);

        $pending = $this->postJson('/api/inventory/adjustments', [
            'type' => 'stock_take',
            'status' => 'pending',
            'items' => [
                ['item_id' => $this->itemId, 'actual_stock' => 6],
            ],
        ])->assertStatus(201);

        $pendingId = $pending->json('data.id');

        // Stock unchanged while pending.
        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 5.0]);

        $this->postJson("/api/inventory/adjustments/{$pendingId}/approve")->assertOk();

        $this->assertDatabaseHas('inventory_adjustments', ['id' => $pendingId, 'status' => 'approved']);
        $this->assertDatabaseHas('inventory_items', ['id' => $this->itemId, 'current_stock' => 6.0]);

        // Already-approved adjustments cannot be approved again.
        $this->postJson("/api/inventory/adjustments/{$approvedId}/approve")->assertStatus(422);
    }

    public function test_cross_restaurant_stock_actions_are_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherItem = InventoryItem::create(['restaurant_id' => $other->id, 'name' => 'Foreign Stock']);

        $this->postJson("/api/inventory/items/{$otherItem->id}/adjust-stock", ['quantity' => 1])
            ->assertStatus(403);

        $otherTransfer = InventoryTransfer::create([
            'restaurant_id' => $other->id,
            'reference_number' => 'TRF-OTH1',
            'from_branch_id' => $this->createBranch($this->restaurant)->id,
            'to_branch_id' => $this->createBranch($this->restaurant)->id,
            'status' => 'in_transit',
            'requested_by' => auth()->id(),
        ]);

        $this->postJson("/api/inventory/transfers/{$otherTransfer->id}/receive", [])
            ->assertStatus(403);

        $otherAdjustment = InventoryAdjustment::create([
            'restaurant_id' => $other->id,
            'reference_number' => 'ADJ-OTH1',
            'status' => 'pending',
            'requested_by' => auth()->id(),
        ]);

        $this->postJson("/api/inventory/adjustments/{$otherAdjustment->id}/approve")
            ->assertStatus(403);
    }
}