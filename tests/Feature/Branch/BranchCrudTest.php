<?php

namespace Tests\Feature\Branch;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Branch\Models\Branch;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class BranchCrudTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
    }

    public function test_branch_can_be_created_for_own_restaurant(): void
    {
        $this->postJson('/api/v1/branches', ['name' => 'Downtown'])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Downtown');

        $this->assertDatabaseHas('branches', [
            'name' => 'Downtown',
            'restaurant_id' => $this->restaurant->id,
        ]);
    }

    public function test_branch_creation_requires_name(): void
    {
        $this->postJson('/api/v1/branches', [])->assertStatus(422);
    }

    public function test_owner_can_show_update_and_delete_own_branch(): void
    {
        $branch = $this->createBranch($this->restaurant);

        $this->getJson("/api/v1/branches/{$branch->id}")->assertOk();

        $this->putJson("/api/v1/branches/{$branch->id}", ['name' => 'Uptown'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Uptown');

        $this->deleteJson("/api/v1/branches/{$branch->id}")->assertOk();
        $this->assertSoftDeleted('branches', ['id' => $branch->id]);
    }

    public function test_cross_restaurant_branch_access_is_forbidden(): void
    {
        $otherRestaurant = $this->createRestaurant();
        $otherBranch = $this->createBranch($otherRestaurant);

        $this->getJson("/api/v1/branches/{$otherBranch->id}")->assertStatus(403);
        $this->putJson("/api/v1/branches/{$otherBranch->id}", ['name' => 'Hijacked'])->assertStatus(403);
        $this->deleteJson("/api/v1/branches/{$otherBranch->id}")->assertStatus(403);
    }

    public function test_branch_list_only_contains_own_restaurant_branches(): void
    {
        $this->createBranch($this->restaurant);
        $otherRestaurant = $this->createRestaurant();
        $this->createBranch($otherRestaurant);

        $this->getJson('/api/v1/branches?per_page=50')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}