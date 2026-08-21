<?php

namespace Tests\Feature\Auth;

use App\Http\Middleware\RestaurantScope;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Modules\Branch\Models\Branch;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class ScopingMultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_list_sees_only_own_restaurant(): void
    {
        $mine = $this->createRestaurant(['name' => 'My Restaurant']);
        $this->createRestaurant(['name' => 'Someone Else Restaurant']);
        $this->actingAsRestaurantOwner($mine);

        $this->getJson('/api/v1/restaurants?per_page=50')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $mine->id);
    }

    public function test_owner_cannot_show_or_update_another_restaurant(): void
    {
        $mine = $this->createRestaurant();
        $theirs = $this->createRestaurant();
        $this->actingAsRestaurantOwner($mine);

        $this->getJson("/api/v1/restaurants/{$theirs->id}")->assertStatus(403);

        $this->putJson("/api/v1/restaurants/{$theirs->id}", ['name' => 'Hijacked'])
            ->assertStatus(403);
    }

    public function test_branch_user_list_sees_only_own_restaurant_branches(): void
    {
        $restaurant = $this->createRestaurant();
        $other = $this->createRestaurant();
        $branch = $this->createBranch($restaurant);
        $this->createBranch($other);

        $this->actingAsBranchUser($branch);

        $this->getJson('/api/v1/branches?per_page=50')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $branch->id);
    }

    public function test_context_helpers_resolve_for_branch_user(): void
    {
        $restaurant = $this->createRestaurant();
        $branch = $this->createBranch($restaurant);

        $this->actingAsBranchUser($branch);

        $this->assertSame($restaurant->id, getRestaurantId());
        $this->assertSame($branch->id, getBranchId());
    }

    public function test_context_helpers_return_null_for_super_admin(): void
    {
        $this->actingAsSuperAdmin();

        $this->assertNull(getRestaurantId());
        $this->assertNull(getBranchId());
    }

    public function test_restaurant_scope_middleware_injects_ids_on_user(): void
    {
        $restaurant = $this->createRestaurant();
        $branch = $this->createBranch($restaurant);
        $user = $this->createBranchUser($branch);

        $request = Request::create('/api/activity-logs', 'GET');
        $request->setUserResolver(fn () => $user);

        (new RestaurantScope())->handle($request, fn ($req) => null);

        $this->assertSame($restaurant->id, $user->_restaurant_id);
        $this->assertSame($branch->id, $user->_branch_id);
    }

    public function test_inactive_restaurant_is_blocked_on_write(): void
    {
        $restaurant = $this->createRestaurant(['status' => 'inactive']);
        $this->actingAsRestaurantOwner($restaurant);

        $this->postJson('/api/v1/branches', ['name' => 'New Branch'])->assertStatus(403);
    }

    public function test_active_trial_restaurant_passes_module_access(): void
    {
        $restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($restaurant);

        $this->getJson('/api/v1/branches')->assertOk();
    }
}