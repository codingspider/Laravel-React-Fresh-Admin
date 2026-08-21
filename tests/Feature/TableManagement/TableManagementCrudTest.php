<?php

namespace Tests\Feature\TableManagement;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Restaurant\Models\Restaurant;
use Modules\TableManagement\Models\Floor;
use Modules\TableManagement\Models\Table;
use Tests\TestCase;

class TableManagementCrudTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
    }

    private function createFloor(array $overrides = []): Floor
    {
        return Floor::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Floor ' . uniqid(),
            'status' => 'active',
            ...$overrides,
        ]);
    }

    private function createTable(Floor $floor, array $overrides = []): Table
    {
        return Table::create([
            'restaurant_id' => $this->restaurant->id,
            'floor_id' => $floor->id,
            'name' => 'Table ' . uniqid(),
            'capacity' => 4,
            'status' => 'available',
            ...$overrides,
        ]);
    }

    public function test_floor_crud_flow(): void
    {
        $store = $this->postJson('/api/v1/floors', ['name' => 'Ground Floor'])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Ground Floor');

        $id = $store->json('data.id');
        $this->assertDatabaseHas('floors', ['id' => $id, 'restaurant_id' => $this->restaurant->id]);

        $this->getJson("/api/v1/floors/{$id}")->assertOk();

        $this->putJson("/api/v1/floors/{$id}", ['name' => 'First Floor'])
            ->assertOk()
            ->assertJsonPath('data.name', 'First Floor');

        $this->deleteJson("/api/v1/floors/{$id}")->assertOk();
        $this->assertSoftDeleted('floors', ['id' => $id]);
    }

    public function test_cross_restaurant_floor_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherFloor = $this->createFloor(['restaurant_id' => $other->id]);

        $this->getJson("/api/v1/floors/{$otherFloor->id}")->assertStatus(403);
        $this->deleteJson("/api/v1/floors/{$otherFloor->id}")->assertStatus(403);
    }

    public function test_table_crud_flow_updates_floor_table_status(): void
    {
        $floor = $this->createFloor();

        $store = $this->postJson('/api/v1/tables', [
            'name' => 'T1',
            'floor_id' => $floor->id,
            'capacity' => 6,
        ])->assertStatus(201)
            ->assertJsonPath('data.name', 'T1');

        $id = $store->json('data.id');

        $this->assertDatabaseHas('tables', [
            'id' => $id,
            'floor_id' => $floor->id,
            'restaurant_id' => $this->restaurant->id,
            'capacity' => 6,
        ]);

        $this->getJson("/api/v1/tables/{$id}")->assertOk();

        $this->putJson("/api/v1/tables/{$id}", ['name' => 'T1 Renamed', 'capacity' => 8])
            ->assertOk()
            ->assertJsonPath('data.name', 'T1 Renamed');

        $this->putJson("/api/v1/tables/{$id}/status", ['status' => 'occupied'])->assertOk();
        $this->assertDatabaseHas('tables', ['id' => $id, 'status' => 'occupied']);

        $this->deleteJson("/api/v1/tables/{$id}")->assertOk();
        $this->assertSoftDeleted('tables', ['id' => $id]);
    }

    public function test_table_store_requires_valid_floor_and_capacity(): void
    {
        $this->postJson('/api/v1/tables', ['name' => 'No Floor'])
            ->assertStatus(422);

        $floor = $this->createFloor();
        $this->postJson('/api/v1/tables', ['name' => 'No Cap', 'floor_id' => $floor->id])
            ->assertStatus(422);
    }

    public function test_cannot_create_table_on_another_restaurant_floor(): void
    {
        $other = $this->createRestaurant();
        $otherFloor = $this->createFloor(['restaurant_id' => $other->id]);

        $this->postJson('/api/v1/tables', [
            'name' => 'Sneaky',
            'floor_id' => $otherFloor->id,
            'capacity' => 4,
        ])->assertStatus(422);

        $this->assertDatabaseCount('tables', 0);
    }

    public function test_cross_restaurant_table_update_and_delete_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherFloor = $this->createFloor(['restaurant_id' => $other->id]);
        $otherTable = $this->createTable($otherFloor, ['restaurant_id' => $other->id]);

        $this->putJson("/api/v1/tables/{$otherTable->id}", ['name' => 'Hijacked', 'capacity' => 4])->assertStatus(403);
        $this->deleteJson("/api/v1/tables/{$otherTable->id}")->assertStatus(403);
    }

    public function test_reservation_lifecycle_updates_table_status(): void
    {
        $floor = $this->createFloor();
        $table = $this->createTable($floor);

        $reservation = $this->postJson('/api/v1/reservations', [
            'table_id' => $table->id,
            'guest_name' => 'John Doe',
            'guest_count' => 3,
            'reservation_date' => date('Y-m-d'),
            'reservation_time' => '19:30',
        ])->assertStatus(201);

        $id = $reservation->json('data.id');
        $this->assertDatabaseHas('reservations', ['id' => $id, 'status' => 'pending']);
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'reserved']);

        $this->putJson("/api/v1/reservations/{$id}/confirm")->assertOk();
        $this->assertDatabaseHas('reservations', ['id' => $id, 'status' => 'confirmed']);

        $this->putJson("/api/v1/reservations/{$id}/seat")->assertOk();
        $this->assertDatabaseHas('reservations', ['id' => $id, 'status' => 'seated']);
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'occupied']);

        $this->putJson("/api/v1/reservations/{$id}/complete")->assertOk();
        $this->assertDatabaseHas('reservations', ['id' => $id, 'status' => 'completed']);
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'available']);
    }

    public function test_reservation_cancel_and_no_show(): void
    {
        $floor = $this->createFloor();
        $table = $this->createTable($floor);

        $reservation = $this->postJson('/api/v1/reservations', [
            'table_id' => $table->id,
            'guest_name' => 'Jane Doe',
            'guest_count' => 2,
            'reservation_date' => date('Y-m-d'),
            'reservation_time' => '20:00',
        ])->assertStatus(201);
        $id = $reservation->json('data.id');

        $this->putJson("/api/v1/reservations/{$id}/no-show")->assertOk();
        $this->assertDatabaseHas('reservations', ['id' => $id, 'status' => 'no_show']);

        $this->putJson("/api/v1/reservations/{$id}/cancel")->assertOk();
        $this->assertDatabaseHas('reservations', ['id' => $id, 'status' => 'cancelled']);
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'status' => 'available']);
    }

    public function test_cross_restaurant_reservation_access_is_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherFloor = $this->createFloor(['restaurant_id' => $other->id]);
        $otherTable = $this->createTable($otherFloor, ['restaurant_id' => $other->id]);

        // Creating a reservation against another restaurant's table is blocked.
        $this->postJson('/api/v1/reservations', [
            'table_id' => $otherTable->id,
            'guest_name' => 'Intruder',
            'guest_count' => 1,
            'reservation_date' => date('Y-m-d'),
            'reservation_time' => '18:00',
        ])->assertStatus(403);

        $this->assertDatabaseCount('reservations', 0);
    }
}