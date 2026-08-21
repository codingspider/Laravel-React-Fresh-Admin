<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;
use Modules\Branch\Models\Branch;
use Modules\Restaurant\Models\Restaurant;
use Spatie\Permission\PermissionRegistrar;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed the application's roles and permissions idempotently.
     * Safe to call from within any test (respects the RefreshDatabase
     * per-test transaction by clearing the spatie registrar cache first).
     */
    protected function seedRolesAndPermissions(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->seed(UserSeeder::class);
    }

    /**
     * Create a restaurant row (optionally overriding factory attributes).
     */
    protected function createRestaurant(array $attributes = []): Restaurant
    {
        return Restaurant::factory()->create($attributes);
    }

    /**
     * Create a branch for a restaurant (model or id).
     */
    protected function createBranch(Restaurant|int $restaurant, array $attributes = []): Branch
    {
        $restaurantId = $restaurant instanceof Restaurant ? $restaurant->id : $restaurant;

        return Branch::factory()->create([
            'restaurant_id' => $restaurantId,
            ...$attributes,
        ]);
    }

    /**
     * Create a restaurant_owner user, optionally linked to a restaurant.
     */
    protected function createOwner(?Restaurant $restaurant = null): User
    {
        $this->seedRolesAndPermissions();

        $user = User::factory()->create();

        if ($restaurant) {
            $user->forceFill(['restaurant_id' => $restaurant->id])->save();
        }

        $user->assignRole('restaurant_owner');

        return $user;
    }

    /**
     * Create a restaurant_owner user scoped to a single branch.
     */
    protected function createBranchUser(Branch $branch): User
    {
        $this->seedRolesAndPermissions();

        $user = User::factory()->forBranch($branch)->create();
        $user->assignRole('restaurant_owner');

        return $user;
    }

    /**
     * Create a user holding a single explicit role.
     */
    protected function createUserWithRole(string $role): User
    {
        $this->seedRolesAndPermissions();

        return tap(User::factory()->create(), fn (User $user) => $user->assignRole($role));
    }

    protected function createSuperAdmin(): User
    {
        return $this->createUserWithRole('super_admin');
    }

    protected function createAdmin(): User
    {
        return $this->createUserWithRole('admin');
    }

    protected function actingAsSuperAdmin(): User
    {
        return tap($this->createSuperAdmin(), fn (User $user) => Sanctum::actingAs($user));
    }

    protected function actingAsAdmin(): User
    {
        return tap($this->createAdmin(), fn (User $user) => Sanctum::actingAs($user));
    }

    protected function actingAsRestaurantOwner(?Restaurant $restaurant = null): User
    {
        return tap($this->createOwner($restaurant), fn (User $user) => Sanctum::actingAs($user));
    }

    protected function actingAsBranchUser(Branch $branch): User
    {
        return tap($this->createBranchUser($branch), fn (User $user) => Sanctum::actingAs($user));
    }
}