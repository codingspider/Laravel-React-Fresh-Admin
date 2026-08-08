<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Modules\Customer\Models\Customer;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class CrmModuleApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'owner_id' => $this->user->id,
            'name' => 'CRM API Restaurant',
            'slug' => 'crm-api-' . uniqid(),
        ]);
        $this->user->update(['restaurant_id' => $this->restaurant->id]);

        // The CRM routes run through the module.access middleware, which allows
        // restaurants within a trial window through without an active subscription.
        $this->restaurant->update(['trial_ends_at' => now()->addDays(7)]);

        $this->user->givePermissionTo(
            collect([
                'view_customers', 'create_customers', 'update_customers', 'delete_customers',
                'view_segments', 'create_segments', 'update_segments', 'delete_segments',
                'view_follow_ups', 'create_follow_ups', 'update_follow_ups', 'delete_follow_ups', 'complete_follow_ups',
                'view_customer_notes', 'create_customer_notes', 'delete_customer_notes',
                'view_crm_dashboard',
            ])->map(fn ($name) => \Spatie\Permission\Models\Permission::findOrCreate($name))->all()
        );

        Sanctum::actingAs($this->user);
    }

    private function makeCustomer(string $name = 'CRM Customer', string $phone = '01744444444'): Customer
    {
        return Customer::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => $name,
            'phone' => $phone,
        ]);
    }

    public function test_dashboard_returns_expected_stats(): void
    {
        $this->makeCustomer('Dash Customer', '01790000001');

        $response = $this->getJson('/api/v1/crm/dashboard');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['data' => [
                'total_customers',
                'new_customers_this_month',
                'active_customers',
                'total_spent',
                'pending_follow_ups',
                'upcoming_birthdays',
                'upcoming_anniversaries',
                'segment_breakdown',
                'recent_customers',
            ]])
            ->assertJsonPath('data.total_customers', 1);
    }

    public function test_customer_crud_via_api(): void
    {
        $create = $this->postJson('/api/v1/crm/customers', [
            'name' => 'Alice Smith',
            'email' => 'alice@example.com',
            'phone' => '01777777777',
            'source' => 'manual',
        ]);

        $create->assertCreated()->assertJsonPath('data.name', 'Alice Smith');
        $customerId = $create->json('data.id');
        $this->assertDatabaseHas('customers', ['id' => $customerId, 'name' => 'Alice Smith']);

        $this->putJson("/api/v1/crm/customers/{$customerId}", [
            'name' => 'Alice Johnson',
            'lead_status' => 'qualified',
        ])->assertOk()->assertJsonPath('data.lead_status', 'qualified');

        $this->getJson("/api/v1/crm/customers/{$customerId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Alice Johnson');

        $list = $this->getJson('/api/v1/crm/customers?search=Alice');
        $list->assertOk();
        $this->assertSame(1, count($list->json('data')));

        $this->deleteJson("/api/v1/crm/customers/{$customerId}")->assertOk();
        $this->assertSoftDeleted('customers', ['id' => $customerId]);
    }

    public function test_segment_crud_and_customer_assignment(): void
    {
        $customer = $this->makeCustomer('Segment Customer', '01744444444');

        $create = $this->postJson('/api/v1/crm/segments', [
            'restaurant_id' => $this->restaurant->id,
            'name' => 'VIP',
            'color' => '#f59e0b',
            'description' => 'High spenders',
        ]);

        $create->assertCreated()->assertJsonPath('data.name', 'VIP');
        $segmentId = $create->json('data.id');
        $this->assertDatabaseHas('crm_segments', ['id' => $segmentId, 'name' => 'VIP']);

        $this->postJson("/api/v1/crm/segments/{$segmentId}/customers", [
            'customer_ids' => [$customer->id],
        ])->assertOk();
        $this->assertDatabaseHas('crm_customer_segment', [
            'crm_segment_id' => $segmentId,
            'customer_id' => $customer->id,
        ]);

        $this->putJson("/api/v1/crm/segments/{$segmentId}", [
            'name' => 'Premium',
        ])->assertOk()->assertJsonPath('data.name', 'Premium');

        $list = $this->getJson('/api/v1/crm/segments');
        $list->assertOk();
        $names = collect($list->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Premium'));

        $this->deleteJson("/api/v1/crm/segments/{$segmentId}")->assertOk();
        $this->assertSoftDeleted('crm_segments', ['id' => $segmentId]);
    }

    public function test_follow_up_lifecycle(): void
    {
        $customer = $this->makeCustomer('Follow Up Customer', '01755555555');

        $create = $this->postJson('/api/v1/crm/follow-ups', [
            'customer_id' => $customer->id,
            'title' => 'Birthday call',
            'notes' => 'Call on birthday',
            'due_at' => now()->addDays(3)->toDateTimeString(),
        ]);

        $create->assertCreated()->assertJsonPath('data.title', 'Birthday call');
        $followUpId = $create->json('data.id');
        $this->assertDatabaseHas('crm_follow_ups', ['id' => $followUpId, 'status' => 'pending']);

        $this->postJson("/api/v1/crm/follow-ups/{$followUpId}/complete")->assertOk();
        $this->assertDatabaseHas('crm_follow_ups', ['id' => $followUpId, 'status' => 'completed']);

        $this->putJson("/api/v1/crm/follow-ups/{$followUpId}", [
            'title' => 'Birthday call (updated)',
        ])->assertOk()->assertJsonPath('data.title', 'Birthday call (updated)');

        $list = $this->getJson('/api/v1/crm/follow-ups?status=completed');
        $list->assertOk();
        $this->assertSame(1, count($list->json('data')));

        $this->deleteJson("/api/v1/crm/follow-ups/{$followUpId}")->assertOk();
        $this->assertSoftDeleted('crm_follow_ups', ['id' => $followUpId]);
    }

    public function test_customer_notes_lifecycle(): void
    {
        $customer = $this->makeCustomer('Note Customer', '01766666666');

        $create = $this->postJson("/api/v1/crm/customers/{$customer->id}/notes", [
            'body' => 'Prefers window seat',
        ]);

        $create->assertCreated()->assertJsonPath('data.body', 'Prefers window seat');
        $noteId = $create->json('data.id');
        $this->assertDatabaseHas('crm_notes', ['id' => $noteId, 'body' => 'Prefers window seat']);

        $index = $this->getJson("/api/v1/crm/customers/{$customer->id}/notes");
        $index->assertOk();
        $this->assertSame(1, count($index->json('data')));

        $this->deleteJson("/api/v1/crm/notes/{$noteId}")->assertOk();
        $this->assertSoftDeleted('crm_notes', ['id' => $noteId]);
    }
}
