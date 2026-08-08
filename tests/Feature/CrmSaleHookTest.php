<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Modules\Branch\Models\Branch;
use Modules\Customer\Models\Customer;
use Modules\POS\Models\Sale;
use Modules\POS\Services\PosService;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class CrmSaleHookTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Restaurant $restaurant;
    private Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'owner_id' => $this->user->id,
            'name' => 'Hook Test Restaurant',
            'slug' => 'hook-test-' . uniqid(),
        ]);
        $this->branch = Branch::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Main',
        ]);

        // The Notification listener on SaleCompleted queries users holding
        // view_orders, which requires the permission row to exist.
        \Spatie\Permission\Models\Permission::findOrCreate('view_orders');

        Sanctum::actingAs($this->user);
    }

    private function makeSale(array $overrides = []): Sale
    {
        return Sale::create(array_merge([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'user_id' => $this->user->id,
            'invoice_number' => 'INV-TEST-' . Str::upper(Str::random(8)),
            'order_type' => 'dine_in',
            'status' => 'pending',
            'subtotal' => 500,
            'total' => 500,
            'payment_status' => 'unpaid',
        ], $overrides));
    }

    private function completeSale(Sale $sale, float $amount): Sale
    {
        return app(PosService::class)->processPayment($sale, [
            'payment_method' => 'cash',
            'amount' => $amount,
        ]);
    }

    public function test_completing_guest_sale_creates_and_links_customer(): void
    {
        $sale = $this->makeSale([
            'guest_name' => 'John Doe',
            'guest_phone' => '01711111111',
        ]);

        $completed = $this->completeSale($sale, 500);

        $this->assertSame('completed', $completed->status);

        $customer = Customer::where('phone', '01711111111')->first();
        $this->assertNotNull($customer);
        $this->assertSame('John Doe', $customer->name);
        $this->assertSame('pos', $customer->source);
        $this->assertSame(1, (int) $customer->total_orders);
        $this->assertSame(500.0, (float) $customer->total_spent);
        $this->assertNotNull($customer->last_visit_at);
        $this->assertSame($customer->id, (int) $completed->customer_id);
    }

    public function test_repeat_guest_phone_updates_existing_customer(): void
    {
        Customer::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Existing Guest',
            'phone' => '01722222222',
            'total_orders' => 2,
            'total_spent' => 900,
        ]);

        $sale = $this->makeSale([
            'guest_name' => 'Existing Guest',
            'guest_phone' => '01722222222',
        ]);

        $completed = $this->completeSale($sale, 500);

        $this->assertSame(1, Customer::where('phone', '01722222222')->count());

        $customer = Customer::where('phone', '01722222222')->first();
        $this->assertSame(3, (int) $customer->total_orders);
        $this->assertSame(1400.0, (float) $customer->total_spent);
        $this->assertSame($customer->id, (int) $completed->customer_id);
    }

    public function test_linked_customer_increments_counters(): void
    {
        $customer = Customer::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Linked Customer',
            'phone' => '01733333333',
        ]);

        $sale = $this->makeSale([
            'customer_id' => $customer->id,
            'guest_name' => 'Linked Customer',
        ]);

        $completed = $this->completeSale($sale, 500);

        $customer->refresh();
        $this->assertSame(1, (int) $customer->total_orders);
        $this->assertSame(500.0, (float) $customer->total_spent);
        $this->assertSame($customer->id, (int) $completed->customer_id);
    }

    public function test_untracked_walk_in_does_not_create_customer(): void
    {
        $sale = $this->makeSale();

        $this->completeSale($sale, 500);

        $this->assertSame(0, Customer::count());
    }

    public function test_partial_payment_does_not_complete_sale_or_capture_customer(): void
    {
        $sale = $this->makeSale([
            'guest_name' => 'Partial Payer',
            'guest_phone' => '01799999999',
        ]);

        $partial = app(PosService::class)->processPayment($sale, [
            'payment_method' => 'cash',
            'amount' => 250,
        ]);

        $this->assertSame('partial', $partial->payment_status);
        $this->assertNotSame('completed', $partial->status);
        $this->assertSame(0, Customer::count());
    }

    public function test_guest_customer_source_is_used(): void
    {
        $sale = $this->makeSale([
            'source' => 'qr',
            'guest_name' => 'QR Guest',
            'guest_phone' => '01788888888',
        ]);

        $this->completeSale($sale, 500);

        $customer = Customer::where('phone', '01788888888')->first();
        $this->assertNotNull($customer);
        $this->assertSame('qr', $customer->source);
    }

    public function test_cash_overpayment_caps_amount_paid_and_records_change(): void
    {
        $sale = $this->makeSale();

        $paid = $this->completeSale($sale, 700);

        $this->assertSame('paid', $paid->payment_status);
        $this->assertSame('completed', $paid->status);
        $this->assertSame(500.0, (float) $paid->amount_paid);
        $this->assertSame(200.0, (float) $paid->change_amount);
        $this->assertSame(1, $paid->payments->count());
        $this->assertSame(200.0, (float) $paid->payments->first()->change);
    }

    public function test_partial_then_overpayment_accumulates_change(): void
    {
        $sale = $this->makeSale();

        app(PosService::class)->processPayment($sale, [
            'payment_method' => 'cash',
            'amount' => 300,
        ]);

        $paid = app(PosService::class)->processPayment($sale, [
            'payment_method' => 'cash',
            'amount' => 300,
        ]);

        $this->assertSame('paid', $paid->payment_status);
        $this->assertSame(500.0, (float) $paid->amount_paid);
        $this->assertSame(100.0, (float) $paid->change_amount);
        $this->assertSame(0.0, (float) $paid->payments[0]->change);
        $this->assertSame(100.0, (float) $paid->payments[1]->change);
    }
}
