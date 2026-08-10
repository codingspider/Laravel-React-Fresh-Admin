<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Modules\Branch\Models\Branch;
use Modules\Notification\Events\LowStockAlert;
use Modules\Notification\Models\SmsTemplate;
use Modules\Notification\Services\SmsService;
use Modules\POS\Events\SaleCompleted;
use Modules\POS\Models\Sale;
use Modules\Restaurant\Models\Restaurant;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AutoNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Restaurant $restaurant;
    private Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'owner_id' => $this->owner->id,
            'name' => 'Auto Notify Restaurant',
            'slug' => 'auto-notify-' . uniqid(),
            'phone' => '+8801700000001',
            'trial_ends_at' => now()->addDays(7),
        ]);
        $this->branch = Branch::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Main',
            'is_main' => true,
        ]);

        Permission::findOrCreate('view_orders');
        Permission::findOrCreate('view_inventory');

        app(\Modules\Notification\Services\NotificationSettingService::class)->update(
            $this->restaurant->id,
            $this->branch->id,
            [
                'sms_enabled' => true,
                'whatsapp_enabled' => true,
                'sms' => ['sid' => 'ACtest', 'token' => 'token', 'from' => '+1555'],
                'whatsapp' => ['sid' => 'ACtest', 'token' => 'token', 'from' => '+1555'],
            ]
        );

        foreach ([
            ['Order Confirmation', 'sms'],
            ['Order Confirmation', 'whatsapp'],
            ['Low Stock Alert', 'sms'],
            ['Low Stock Alert', 'whatsapp'],
        ] as [$name, $channel]) {
            SmsTemplate::create([
                'name' => $name,
                'channel' => $channel,
                'body' => '{customer} {order_id} {restaurant_name} {item} {stock}',
                'is_active' => true,
            ]);
        }

        Sanctum::actingAs($this->owner);
    }

    private function mockSmsService(): void
    {
        $mock = $this->mock(SmsService::class);
        $mock->shouldReceive('send')
            ->twice()
            ->andReturn(['sid' => 'SMtest', 'channel' => 'sms']);
    }

    public function test_sale_completed_sends_order_confirmation_to_guest(): void
    {
        $this->mockSmsService();

        $sale = Sale::create([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'user_id' => $this->owner->id,
            'invoice_number' => 'INV-1001',
            'guest_name' => 'John',
            'guest_phone' => '+8801711111111',
            'order_type' => 'dine_in',
            'status' => 'completed',
            'subtotal' => 500,
            'total' => 500,
            'payment_status' => 'paid',
        ]);

        SaleCompleted::dispatch($sale);
    }

    public function test_sale_without_guest_phone_skips_messaging(): void
    {
        $mock = $this->mock(SmsService::class);
        $mock->shouldNotReceive('send');

        $sale = Sale::create([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'user_id' => $this->owner->id,
            'invoice_number' => 'INV-1002',
            'order_type' => 'dine_in',
            'status' => 'completed',
            'subtotal' => 200,
            'total' => 200,
            'payment_status' => 'paid',
        ]);

        SaleCompleted::dispatch($sale);
    }

    public function test_low_stock_alert_sends_to_restaurant_phone(): void
    {
        $this->mockSmsService();

        $item = InventoryItem::create([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'name' => 'Flour',
            'type' => 'raw_material',
            'current_stock' => 1,
            'minimum_stock' => 5,
        ]);

        LowStockAlert::dispatch($item, 1.0, $this->restaurant->id);
    }
}
