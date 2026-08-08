<?php

namespace Tests\Feature;

use App\Http\Middleware\LogActivity;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    protected function runMiddleware(string $method, string $uri, array $payload = [], ?User $user = null): Response
    {
        $request = Request::create($uri, $method, $payload);
        $request->setUserResolver(fn () => $user);

        $middleware = new LogActivity();
        $response = $middleware->handle($request, fn () => response()->json(['status' => 'success']));
        $middleware->terminate($request, $response);

        return $response;
    }

    public function test_write_request_is_logged(): void
    {
        $user = User::factory()->create();

        $this->runMiddleware('POST', '/api/menu-items', [
            'name' => 'Margherita Pizza',
            'price' => 12.99,
            'password' => 'super-secret',
        ], $user);

        $log = ActivityLog::first();

        $this->assertNotNull($log);
        $this->assertSame('create', $log->action);
        $this->assertSame('POST', $log->method);
        $this->assertSame('api/menu-items', $log->path);
        $this->assertSame($user->id, $log->user_id);
        $this->assertSame('Created menu item', $log->description);
        $this->assertSame(200, $log->response_status);
        $this->assertSame('Margherita Pizza', $log->request_data['name']);
        $this->assertArrayNotHasKey('password', $log->request_data);
    }

    public function test_get_request_is_not_logged(): void
    {
        $this->runMiddleware('GET', '/api/menu-items');

        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_auth_endpoints_are_not_logged(): void
    {
        $this->runMiddleware('POST', '/api/login', ['email' => 'a@b.c', 'password' => 'x']);

        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_update_and_delete_actions(): void
    {
        $this->runMiddleware('PUT', '/api/menu-items/42', ['price' => 15.00]);
        $this->runMiddleware('DELETE', '/api/menu-items/42');

        $logs = ActivityLog::orderBy('id')->get();

        $this->assertCount(2, $logs);
        $this->assertSame('update', $logs[0]->action);
        $this->assertSame('Updated menu item #42', $logs[0]->description);
        $this->assertSame('delete', $logs[1]->action);
        $this->assertSame('Deleted menu item #42', $logs[1]->description);
    }

    public function test_base64_payload_is_scrubbed(): void
    {
        $this->runMiddleware('POST', '/api/restaurants', [
            'name' => 'Demo',
            'logo' => 'data:image/png;base64,AAAA...',
        ]);

        $log = ActivityLog::first();

        $this->assertSame('[base64 data omitted]', $log->request_data['logo']);
    }

    public function test_list_scopes_to_restaurant_includes_legacy_logs_and_meta(): void
    {
        $user = User::factory()->create();
        $restaurant = \Modules\Restaurant\Models\Restaurant::create([
            'owner_id' => $user->id,
            'name' => 'Log Test Restaurant',
            'slug' => 'log-test-' . uniqid(),
        ]);
        $otherRestaurant = \Modules\Restaurant\Models\Restaurant::create([
            'owner_id' => $user->id,
            'name' => 'Other Restaurant',
            'slug' => 'other-rest-' . uniqid(),
        ]);
        $user->update(['restaurant_id' => $restaurant->id]);

        \Spatie\Permission\Models\Permission::findOrCreate('view_activity_logs');
        $user->givePermissionTo('view_activity_logs');

        ActivityLog::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'action' => 'create',
            'method' => 'POST',
            'path' => 'api/v1/pos',
            'description' => 'Created sale',
            'response_status' => 200,
        ]);
        ActivityLog::create([
            'action' => 'update',
            'method' => 'PUT',
            'path' => 'api/business/setting/update/1',
            'description' => 'Updated setting',
            'response_status' => 200,
        ]);
        ActivityLog::create([
            'user_id' => $user->id,
            'restaurant_id' => $otherRestaurant->id,
            'action' => 'delete',
            'method' => 'DELETE',
            'path' => 'api/v1/menu/items/5',
            'description' => 'Deleted menu item #5',
            'response_status' => 200,
        ]);

        \Laravel\Sanctum\Sanctum::actingAs($user);

        $response = $this->getJson('/api/activity-logs?per_page=10');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data');
    }
}
