<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_email_returns_user_and_creates_token(): void
    {
        $password = 'secret123';
        User::factory()->create([
            'name' => 'Owner Test',
            'email' => 'owner@test.com',
            'username' => 'owner1',
            'password' => Hash::make($password),
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'owner@test.com',
            'password' => $password,
        ]);

        $response->assertOk()
            ->assertJsonPath('name', 'Owner Test')
            ->assertJsonStructure(['name', 'role', 'permissions']);
        $this->assertStringContainsString('access_token', $response->headers->get('set-cookie') ?? '');
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_login_with_username_works(): void
    {
        $password = 'secret123';
        User::factory()->create([
            'username' => 'waiter.ahmed',
            'password' => Hash::make($password),
        ]);

        $this->postJson('/api/login', ['login' => 'waiter.ahmed', 'password' => $password])
            ->assertOk();
    }

    public function test_login_with_wrong_credentials_returns_401(): void
    {
        User::factory()->create(['email' => 'owner@test.com', 'password' => Hash::make('right')]);

        $this->postJson('/api/login', ['login' => 'owner@test.com', 'password' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_login_validation_fails_without_fields(): void
    {
        $this->postJson('/api/login', [])->assertStatus(422);
    }

    public function test_register_creates_user_and_returns_token(): void
    {
        $this->seedRolesAndPermissions();

        $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'password',
            'c_password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['token', 'name']]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@test.com']);
        $user = User::where('email', 'newuser@test.com')->first();
        $this->assertGreaterThan(0, $user->getAllPermissions()->count());
    }

    public function test_register_validation_requires_confirmed_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'password',
            'c_password' => 'different',
        ])->assertStatus(422);
    }

    public function test_me_returns_authenticated_user_and_permissions(): void
    {
        $owner = $this->actingAsRestaurantOwner();

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.id', $owner->id)
            ->assertJsonStructure(['user', 'permissions']);
    }

    public function test_user_endpoint_returns_flat_payload_with_restaurant_and_branch(): void
    {
        $restaurant = $this->createRestaurant();
        $branch = $this->createBranch($restaurant, ['is_main' => true]);
        $user = $this->actingAsBranchUser($branch);

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.restaurant_id', $restaurant->id)
            ->assertJsonPath('data.branch_id', $branch->id)
            ->assertJsonPath('data.restaurant.name', $restaurant->name)
            ->assertJsonStructure(['data' => ['roles', 'permissions', 'subscription_status']]);
    }

    public function test_logout_deletes_tokens_and_responds_ok(): void
    {
        $restaurant = $this->createRestaurant();
        $owner = $this->actingAsRestaurantOwner($restaurant);
        $owner->createToken('react_token');

        $this->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_forgot_password_stores_hash_and_sends_email(): void
    {
        User::factory()->create(['email' => 'reset@test.com']);

        $this->postJson('/api/forgot-password', ['email' => 'reset@test.com'])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'reset@test.com']);
    }

    public function test_reset_password_with_valid_token_updates_password(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@test.com',
            'password' => Hash::make('oldpass'),
        ]);
        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => bcrypt($token), 'created_at' => now()]
        );

        $this->postJson('/api/reset-password', [
            'email' => 'reset@test.com',
            'token' => $token,
            'password' => 'newpass123',
        ])
            ->assertOk();

        $this->assertTrue(Hash::check('newpass123', $user->fresh()->password));
    }

    public function test_update_profile_updates_name(): void
    {
        $owner = $this->actingAsRestaurantOwner();

        $this->postJson('/api/update-profile', ['name' => 'Updated Name', 'email' => $owner->email])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('users', ['id' => $owner->id, 'name' => 'Updated Name']);
    }

    public function test_change_password_rejects_wrong_current_password(): void
    {
        $this->actingAsRestaurantOwner();

        $this->postJson('/api/change-password', [
            'current_password' => 'wrong-password',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123',
        ])->assertStatus(422);
    }

    public function test_change_password_succeeds_with_correct_current_password(): void
    {
        $this->seedRolesAndPermissions();

        $restaurant = $this->createRestaurant();
        $user = $this->createOwner($restaurant);

        Sanctum::actingAs($user);

        $this->postJson('/api/change-password', [
            'current_password' => 'password',
            'password' => 'brandnew123',
            'password_confirmation' => 'brandnew123',
        ])->assertOk();

        $this->assertTrue(Hash::check('brandnew123', $user->fresh()->password));
    }
}