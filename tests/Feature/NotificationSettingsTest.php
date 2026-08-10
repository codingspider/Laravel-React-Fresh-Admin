<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Modules\Branch\Models\Branch;
use Modules\Notification\Models\SmsTemplate;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class NotificationSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Restaurant $restaurant;
    private Branch $branchA;
    private Branch $branchB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'owner_id' => $this->owner->id,
            'name' => 'Settings Test Restaurant',
            'slug' => 'settings-test-' . uniqid(),
            'trial_ends_at' => now()->addDays(7),
        ]);
        $this->branchA = Branch::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Branch A',
            'is_main' => true,
        ]);
        $this->branchB = Branch::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Branch B',
        ]);
    }

    public function test_owner_can_fetch_settings_for_main_branch(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/v1/notification/settings');

        $response->assertOk()
            ->assertJsonPath('data.branch_id', $this->branchA->id)
            ->assertJsonPath('data.config.sms_enabled', false);
    }

    public function test_owner_can_update_settings_for_a_branch(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->putJson('/api/v1/notification/settings', [
            'branch_id' => $this->branchB->id,
            'config' => [
                'sms_enabled' => true,
                'sms' => ['sid' => 'AC123', 'token' => 'token', 'from' => '+1555'],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.branch_id', $this->branchB->id)
            ->assertJsonPath('data.config.sms_enabled', true);

        $this->assertDatabaseHas('notification_settings', [
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branchB->id,
        ]);
    }

    public function test_manager_cannot_access_another_branch_settings(): void
    {
        $manager = User::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branchB->id,
        ]);
        Sanctum::actingAs($manager);

        $this->getJson('/api/v1/notification/settings?branch_id=' . $this->branchA->id)
            ->assertForbidden();

        $this->putJson('/api/v1/notification/settings', [
            'branch_id' => $this->branchA->id,
            'config' => ['sms_enabled' => true],
        ])->assertForbidden();
    }

    public function test_manager_can_fetch_and_update_own_branch_settings(): void
    {
        $manager = User::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branchB->id,
        ]);
        Sanctum::actingAs($manager);

        $this->getJson('/api/v1/notification/settings')
            ->assertOk()
            ->assertJsonPath('data.branch_id', $this->branchB->id);

        $this->putJson('/api/v1/notification/settings', [
            'config' => ['whatsapp_enabled' => true],
        ])->assertOk()->assertJsonPath('data.config.whatsapp_enabled', true);
    }

    public function test_system_templates_are_returned_for_branch(): void
    {
        SmsTemplate::create([
            'name' => 'Order Ready',
            'channel' => 'sms',
            'body' => 'Your order is ready.',
            'is_active' => true,
        ]);

        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/v1/sms-templates?branch_id=' . $this->branchB->id);

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Order Ready'));
    }

    public function test_owner_can_send_test_email(): void
    {
        Sanctum::actingAs($this->owner);

        $this->putJson('/api/v1/notification/settings', [
            'branch_id' => $this->branchB->id,
            'config' => [
                'email_enabled' => true,
                'email' => ['host' => 'smtp.example.com', 'port' => 587, 'from_email' => 'sender@example.com'],
            ],
        ])->assertOk();

        Mail::fake();

        $this->postJson('/api/v1/notification/test-email', [
            'branch_id' => $this->branchB->id,
            'to' => 'recipient@example.com',
        ])->assertOk()
            ->assertJsonPath('status', 'success');
    }

    public function test_template_crud(): void
    {
        Sanctum::actingAs($this->owner);

        $created = $this->postJson('/api/v1/sms-templates', [
            'branch_id' => $this->branchB->id,
            'name' => 'Welcome',
            'channel' => 'whatsapp',
            'body' => 'Hello {customer}',
            'is_active' => true,
        ]);

        $created->assertCreated()
            ->assertJsonPath('data.name', 'Welcome')
            ->assertJsonPath('data.branch_id', $this->branchB->id);

        $id = $created->json('data.id');

        $this->putJson('/api/v1/sms-templates/' . $id, [
            'branch_id' => $this->branchB->id,
            'body' => 'Welcome {customer}!',
        ])->assertOk()->assertJsonPath('data.body', 'Welcome {customer}!');

        $this->deleteJson('/api/v1/sms-templates/' . $id, [
            'branch_id' => $this->branchB->id,
        ])->assertOk();

        $this->assertDatabaseMissing('sms_templates', ['id' => $id]);
    }
}
