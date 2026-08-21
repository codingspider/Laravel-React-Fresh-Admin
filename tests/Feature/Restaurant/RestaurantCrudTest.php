<?php

namespace Tests\Feature\Restaurant;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class RestaurantCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_restaurant_can_be_created(): void
    {
        $this->actingAsSuperAdmin();

        $this->postJson('/api/v1/restaurants', ['name' => 'Tasty Bites'])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Tasty Bites');

        $this->assertDatabaseHas('restaurants', [
            'name' => 'Tasty Bites',
            'status' => 'active',
        ]);
    }

    public function test_restaurant_creation_requires_name(): void
    {
        $this->actingAsSuperAdmin();

        $this->postJson('/api/v1/restaurants', [])->assertStatus(422);
    }

    public function test_create_restaurant_optionally_creates_owner_user(): void
    {
        $this->seedRolesAndPermissions();
        $this->actingAsSuperAdmin();

        $this->postJson('/api/v1/restaurants', [
            'name' => 'Chain Grill',
            'create_owner' => true,
            'owner_name' => 'Chain Owner',
            'owner_email' => 'chain@test.com',
            'owner_password' => 'secret123',
        ])->assertStatus(201);

        $owner = User::where('email', 'chain@test.com')->first();
        $this->assertNotNull($owner);
        $this->assertTrue($owner->hasRole('restaurant_owner'));
        $this->assertDatabaseHas('restaurants', [
            'name' => 'Chain Grill',
            'owner_id' => $owner->id,
        ]);
    }

    public function test_owner_can_update_own_restaurant(): void
    {
        $mine = $this->createRestaurant();
        $this->actingAsRestaurantOwner($mine);

        $this->putJson("/api/v1/restaurants/{$mine->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed');

        $this->assertDatabaseHas('restaurants', ['id' => $mine->id, 'name' => 'Renamed']);
    }

    public function test_owner_cannot_modify_another_restaurant(): void
    {
        $mine = $this->createRestaurant();
        $theirs = $this->createRestaurant();
        $this->actingAsRestaurantOwner($mine);

        $this->putJson("/api/v1/restaurants/{$theirs->id}", ['name' => 'Hijacked'])
            ->assertStatus(403);

        $this->deleteJson("/api/v1/restaurants/{$theirs->id}")->assertStatus(403);
    }

    public function test_owner_can_delete_own_restaurant(): void
    {
        $mine = $this->createRestaurant();
        $this->actingAsRestaurantOwner($mine);

        $this->deleteJson("/api/v1/restaurants/{$mine->id}")->assertOk();

        $this->assertSoftDeleted('restaurants', ['id' => $mine->id]);
    }

    public function test_list_does_not_expose_other_restaurants(): void
    {
        $mine = $this->createRestaurant();
        $this->createRestaurant();
        $this->actingAsRestaurantOwner($mine);

        $this->getJson('/api/v1/restaurants?per_page=50')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}