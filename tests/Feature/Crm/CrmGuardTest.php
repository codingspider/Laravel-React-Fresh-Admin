<?php

namespace Tests\Feature\Crm;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Modules\CRM\Models\CrmNote;
use Modules\CRM\Models\FollowUp;
use Modules\CRM\Models\Segment;
use Modules\Customer\Models\Customer;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class CrmGuardTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private Restaurant $foreign;
    private int $ownCustomerId;
    private int $foreignCustomerId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant(['trial_ends_at' => now()->addDays(7)]);
        $this->actingAsRestaurantOwner($this->restaurant);

        $this->foreign = $this->createRestaurant();

        $this->ownCustomerId = Customer::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Own Customer',
            'phone' => '01711111111',
        ])->id;

        $this->foreignCustomerId = Customer::create([
            'restaurant_id' => $this->foreign->id,
            'name' => 'Foreign Customer',
            'phone' => '01722222222',
        ])->id;
    }

    public function test_cross_restaurant_customer_is_forbidden(): void
    {
        $this->getJson("/api/v1/crm/customers/{$this->foreignCustomerId}")->assertStatus(403);
        $this->putJson("/api/v1/crm/customers/{$this->foreignCustomerId}", ['name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/v1/crm/customers/{$this->foreignCustomerId}")->assertStatus(403);
    }

    public function test_cross_restaurant_segment_actions_are_forbidden(): void
    {
        $segment = Segment::create(['restaurant_id' => $this->foreign->id, 'name' => 'Foreign VIP']);

        $this->getJson("/api/v1/crm/segments/{$segment->id}")->assertStatus(403);
        $this->putJson("/api/v1/crm/segments/{$segment->id}", ['name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/v1/crm/segments/{$segment->id}")->assertStatus(403);
        $this->postJson("/api/v1/crm/segments/{$segment->id}/customers", [
            'customer_ids' => [$this->ownCustomerId],
        ])->assertStatus(403);
    }

    public function test_cross_restaurant_follow_up_actions_are_forbidden(): void
    {
        $followUp = FollowUp::create([
            'restaurant_id' => $this->foreign->id,
            'customer_id' => $this->foreignCustomerId,
            'title' => 'Foreign follow-up',
            'status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        $this->putJson("/api/v1/crm/follow-ups/{$followUp->id}", ['title' => 'Hijack'])->assertStatus(403);
        $this->postJson("/api/v1/crm/follow-ups/{$followUp->id}/complete")->assertStatus(403);
        $this->deleteJson("/api/v1/crm/follow-ups/{$followUp->id}")->assertStatus(403);
    }

    public function test_cross_restaurant_notes_are_forbidden(): void
    {
        $this->getJson("/api/v1/crm/customers/{$this->foreignCustomerId}/notes")->assertStatus(403);
        $this->postJson("/api/v1/crm/customers/{$this->foreignCustomerId}/notes", [
            'body' => 'Spy note',
        ])->assertStatus(403);

        $foreignNote = CrmNote::create([
            'restaurant_id' => $this->foreign->id,
            'customer_id' => $this->foreignCustomerId,
            'body' => 'Foreign note',
            'created_by' => auth()->id(),
        ]);

        $this->deleteJson("/api/v1/crm/notes/{$foreignNote->id}")->assertStatus(403);
    }

    public function test_customer_store_cannot_target_another_restaurant(): void
    {
        $created = $this->postJson('/api/v1/crm/customers', [
            'name' => 'Poisoner',
            'restaurant_id' => $this->foreign->id,
        ])->assertStatus(201);

        $this->assertDatabaseHas('customers', [
            'id' => $created->json('data.id'),
            'restaurant_id' => $this->restaurant->id,
        ]);
    }

    public function test_segment_store_cannot_target_another_restaurant(): void
    {
        $created = $this->postJson('/api/v1/crm/segments', [
            'name' => 'Injected Segment',
            'restaurant_id' => $this->foreign->id,
        ])->assertStatus(201);

        $this->assertDatabaseHas('crm_segments', [
            'id' => $created->json('data.id'),
            'restaurant_id' => $this->restaurant->id,
        ]);
    }

    public function test_follow_up_rejects_foreign_customer(): void
    {
        $this->postJson('/api/v1/crm/follow-ups', [
            'customer_id' => $this->foreignCustomerId,
            'title' => 'Cross-tenant call',
        ])->assertStatus(422);

        $this->assertDatabaseMissing('crm_follow_ups', ['customer_id' => $this->foreignCustomerId]);
    }

    public function test_assign_customers_ignores_foreign_ids(): void
    {
        $segment = Segment::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Mine',
            'created_by' => auth()->id(),
        ]);

        $this->postJson("/api/v1/crm/segments/{$segment->id}/customers", [
            'customer_ids' => [$this->ownCustomerId, $this->foreignCustomerId],
        ])->assertOk();

        $this->assertDatabaseHas('crm_customer_segment', [
            'crm_segment_id' => $segment->id,
            'customer_id' => $this->ownCustomerId,
        ]);
        $this->assertDatabaseMissing('crm_customer_segment', [
            'crm_segment_id' => $segment->id,
            'customer_id' => $this->foreignCustomerId,
        ]);
    }

    public function test_customer_segment_ids_must_be_owned(): void
    {
        $foreignSegment = Segment::create(['restaurant_id' => $this->foreign->id, 'name' => 'Foreign']);
        $ownSegment = Segment::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Own',
            'created_by' => auth()->id(),
        ]);

        $created = $this->postJson('/api/v1/crm/customers', [
            'name' => 'Segmented',
            'segment_ids' => [$ownSegment->id, $foreignSegment->id],
        ])->assertStatus(201);

        $customerId = $created->json('data.id');

        $this->assertDatabaseHas('crm_customer_segment', [
            'customer_id' => $customerId,
            'crm_segment_id' => $ownSegment->id,
        ]);
        $this->assertDatabaseMissing('crm_customer_segment', [
            'customer_id' => $customerId,
            'crm_segment_id' => $foreignSegment->id,
        ]);
    }

    public function test_customer_update_cannot_move_to_another_restaurant(): void
    {
        $this->putJson("/api/v1/crm/customers/{$this->ownCustomerId}", [
            'name' => 'Renamed',
            'restaurant_id' => $this->foreign->id,
        ])->assertOk();

        $this->assertDatabaseHas('customers', [
            'id' => $this->ownCustomerId,
            'restaurant_id' => $this->restaurant->id,
        ]);
    }

    public function test_user_without_permission_is_denied(): void
    {
        $intruder = User::factory()->create(['restaurant_id' => $this->restaurant->id]);
        Sanctum::actingAs($intruder);

        $this->getJson('/api/v1/crm/dashboard')->assertStatus(403);
        $this->getJson('/api/v1/crm/customers')->assertStatus(403);
        $this->postJson('/api/v1/crm/customers', ['name' => 'Nope'])->assertStatus(403);
    }
}