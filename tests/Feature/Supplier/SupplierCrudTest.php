<?php

namespace Tests\Feature\Supplier;

use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class SupplierCrudTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
    }

    private function createSupplier(array $overrides = []): int
    {
        return $this->postJson('/api/suppliers', array_merge([
            'name' => 'Fresh Farms',
            'company' => 'Fresh Farms Co.',
            'email' => 'sales@fresfarms.test',
            'phone' => '0123456789',
            'city' => 'Dhaka',
        ], $overrides))->assertStatus(201)->json('data.id');
    }

    public function test_supplier_crud_and_guard(): void
    {
        $id = $this->createSupplier();

        $this->assertDatabaseHas('suppliers', [
            'id' => $id,
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
        ]);

        $this->getJson("/api/suppliers/{$id}")->assertOk();
        $this->putJson("/api/suppliers/{$id}", ['name' => 'Fresh Farms Ltd'])->assertOk();
        $this->deleteJson("/api/suppliers/{$id}")->assertOk();
        $this->assertSoftDeleted('suppliers', ['id' => $id]);

        $other = $this->createRestaurant();
        $otherSupplier = Supplier::create(['restaurant_id' => $other->id, 'name' => 'Foreign Supplier']);

        $this->getJson("/api/suppliers/{$otherSupplier->id}")->assertStatus(403);
        $this->putJson("/api/suppliers/{$otherSupplier->id}", ['name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/suppliers/{$otherSupplier->id}")->assertStatus(403);
    }

    public function test_supplier_requires_name(): void
    {
        $this->postJson('/api/suppliers', ['company' => 'No Name'])->assertStatus(422);
    }

    public function test_contacts_and_primary_demotion(): void
    {
        $id = $this->createSupplier();

        $first = $this->postJson("/api/suppliers/{$id}/contacts", [
            'name' => 'Alice',
            'is_primary' => true,
        ])->assertStatus(201)->json('data.id');

        $second = $this->postJson("/api/suppliers/{$id}/contacts", [
            'name' => 'Bob',
            'is_primary' => true,
        ])->assertStatus(201)->json('data.id');

        $this->assertDatabaseHas('supplier_contacts', ['id' => $first, 'is_primary' => false]);
        $this->assertDatabaseHas('supplier_contacts', ['id' => $second, 'is_primary' => true]);

        $this->deleteJson("/api/suppliers/{$id}/contacts/{$second}")->assertOk();
        $this->assertDatabaseMissing('supplier_contacts', ['id' => $second]);
    }

    public function test_document_upload_and_list(): void
    {
        $publicPath = storage_path('framework/phase4-public');
        $this->app->usePublicPath($publicPath);

        $id = $this->createSupplier();

        $doc = $this->postJson("/api/suppliers/{$id}/documents", [
            'title' => 'Trade License',
            'document_type' => 'license',
            'file' => UploadedFile::fake()->create('license.pdf', 100, 'application/pdf'),
        ])->assertStatus(201)->json('data');

        $this->assertNotEmpty($doc['file_path']);
        $this->assertFileExists($publicPath . '/' . $doc['file_path']);

        $docs = $this->getJson("/api/suppliers/{$id}/documents")->assertOk()->json('data');
        $this->assertNotEmpty($docs);

        \Illuminate\Support\Facades\File::deleteDirectory($publicPath);
    }

    public function test_transactions_and_rating(): void
    {
        $id = $this->createSupplier();

        $txn = $this->postJson("/api/suppliers/{$id}/transactions", [
            'type' => 'adjustment',
            'debit' => 100,
            'credit' => 0,
            'description' => 'opening',
        ])->assertStatus(201)->json('data');

        $this->assertEquals(100.0, (float) $txn['balance']);

        $rating = $this->postJson("/api/suppliers/{$id}/rate", [
            'quality_rating' => 5,
            'delivery_rating' => 4,
            'price_rating' => 3,
            'comment' => 'Great supplier',
        ])->assertOk()->json('data');

        $this->assertEquals(4, (int) $rating['overall_rating']);

        $overview = $this->getJson("/api/suppliers/{$id}/overview")->assertOk()->json('data');
        $this->assertArrayHasKey('outstanding_balance', $overview);
    }

    public function test_cross_restaurant_crm_actions_forbidden(): void
    {
        $other = $this->createRestaurant();
        $otherSupplier = Supplier::create(['restaurant_id' => $other->id, 'name' => 'Foreign']);

        $this->getJson("/api/suppliers/{$otherSupplier->id}/overview")->assertStatus(403);
        $this->postJson("/api/suppliers/{$otherSupplier->id}/contacts", ['name' => 'X'])->assertStatus(403);
        $this->postJson("/api/suppliers/{$otherSupplier->id}/rate", ['quality_rating' => 5])->assertStatus(403);
    }
}