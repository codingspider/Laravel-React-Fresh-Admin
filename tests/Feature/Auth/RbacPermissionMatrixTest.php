<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class RbacPermissionMatrixTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRolesAndPermissions();

        $this->restaurant = $this->createRestaurant();
    }

    /**
     * Endpoints that must be readable by an owner (who holds the mapped
     * permission) and denied to a user without any permissions.
     *
     * @return array<string, array{string, string, string}>
     */
    public static function readEndpointsProvider(): array
    {
        return [
            'restaurants' => ['/api/v1/restaurants', 'view_restaurants'],
            'branches' => ['/api/v1/branches', 'view_branches'],
            'menu categories' => ['/api/v1/menu/categories', 'view_menu_categories'],
            'menu items' => ['/api/v1/menu/items', 'view_menu_items'],
            'menu modifier groups' => ['/api/v1/menu/modifier-groups', 'view_modifier_groups'],
            'floors' => ['/api/v1/floors', 'view_floors'],
            'tables' => ['/api/v1/tables', 'view_tables'],
            'reservations' => ['/api/v1/reservations', 'view_reservations'],
            'customers' => ['/api/v1/customers', 'view_customers'],
            'currencies' => ['/api/v1/currencies', 'view_currencies'],
            'inventory items' => ['/api/inventory-items', 'view_inventory'],
            'kitchen display' => ['/api/v1/kitchen/display', 'view_kitchen_display'],
            'customer display' => ['/api/v1/customer-display', 'view_customer_display'],
        ];
    }

    /**
     * @dataProvider readEndpointsProvider
     */
    public function test_read_endpoint_allowed_for_owner_and_denied_without_permission(string $uri, string $permission): void
    {
        $owner = $this->actingAsRestaurantOwner($this->restaurant);
        $this->assertTrue($owner->hasPermissionTo($permission));

        $this->getJson($uri)->assertOk();

        $this->actingAsPermissionlessUser();

        $this->getJson($uri)->assertStatus(403)
            ->assertJsonPath('code', 'permission_denied');
    }

    public function test_write_middleware_distinguishes_actions_by_method(): void
    {
        // A minimal "viewer" role can list menu items but cannot create them.
        \Spatie\Permission\Models\Role::create(['name' => 'menu_viewer', 'guard_name' => 'web']);
        $viewer = $this->createUserWithRole('menu_viewer');
        $viewer->givePermissionTo('view_menu_items');

        Sanctum::actingAs($viewer);

        $this->getJson('/api/v1/menu/items')->assertOk();

        $this->postJson('/api/v1/menu/items', ['name' => 'Nope'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'permission_denied');
    }

    public function test_route_parameter_is_stripped_before_permission_resolution(): void
    {
        $this->actingAsRestaurantOwner($this->restaurant);

        // A 404 (not 403) proves the permission check passed while the route
        // parameter was stripped for resolution.
        $this->getJson('/api/v1/menu/categories/999999')->assertNotFound();
    }

    public function test_super_admin_bypasses_permission_checks(): void
    {
        $this->actingAsSuperAdmin();

        $this->getJson('/api/v1/restaurants')->assertOk();
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/v1/restaurants')->assertStatus(401);
    }

    private function actingAsPermissionlessUser(): User
    {
        return tap(User::factory()->create(), fn (User $user) => Sanctum::actingAs($user));
    }
}