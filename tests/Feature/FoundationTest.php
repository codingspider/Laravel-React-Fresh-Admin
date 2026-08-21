<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Branch\Models\Branch;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_helpers_bootstrap_restaurant_branch_hierarchy(): void
    {
        $restaurant = $this->createRestaurant(['name' => 'Bootstrap Restaurant']);

        $this->assertDatabaseHas('restaurants', [
            'id' => $restaurant->id,
            'name' => 'Bootstrap Restaurant',
        ]);

        $branch = $this->createBranch($restaurant, ['is_main' => true]);

        $this->assertDatabaseHas('branches', [
            'id' => $branch->id,
            'restaurant_id' => $restaurant->id,
            'is_main' => 1,
        ]);
    }

    public function test_owner_gets_restaurant_and_permissions_from_seeder(): void
    {
        $restaurant = $this->createRestaurant();

        $owner = $this->createOwner($restaurant);

        $this->assertInstanceOf(User::class, $owner);
        $this->assertTrue($owner->hasRole('restaurant_owner'));
        $this->assertSame($restaurant->id, $owner->restaurant_id);
        $this->assertTrue($owner->hasPermissionTo('view_restaurants'));
        $this->assertTrue($owner->hasPermissionTo('process_sale'));
        $this->assertFalse($owner->hasPermissionTo('view_packages'));
    }

    public function test_branch_user_is_scoped_to_branch_and_restaurant(): void
    {
        $restaurant = $this->createRestaurant();
        $branch = $this->createBranch($restaurant);

        $branchUser = $this->createBranchUser($branch);

        $this->assertSame($branch->id, $branchUser->branch_id);
        $this->assertSame($restaurant->id, $branchUser->restaurant_id);
        $this->assertTrue($branchUser->hasRole('restaurant_owner'));
    }

    public function test_super_admin_and_admin_hold_full_permission_matrix(): void
    {
        $superAdmin = $this->createSuperAdmin();
        $admin = $this->createAdmin();

        foreach (['view_restaurants', 'delete_payrolls', 'view_currencies', 'assign_roles'] as $permission) {
            $this->assertTrue($superAdmin->hasPermissionTo($permission));
            $this->assertTrue($admin->hasPermissionTo($permission));
        }

        $this->assertTrue($superAdmin->hasRole('super_admin'));
        $this->assertTrue($admin->hasRole('admin'));
    }

    public function test_acting_helpers_authenticate_sanctum_user(): void
    {
        $restaurant = $this->createRestaurant();
        $branch = $this->createBranch($restaurant);

        $admin = $this->actingAsAdmin();
        $this->assertSame($admin->id, auth()->id());

        $owner = $this->actingAsRestaurantOwner($restaurant);
        $this->assertSame($owner->id, auth()->id());

        $branchUser = $this->actingAsBranchUser($branch);
        $this->assertSame($branchUser->id, auth()->id());
    }
}