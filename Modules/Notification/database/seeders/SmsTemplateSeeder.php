<?php

namespace Modules\Notification\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Notification\Models\SmsTemplate;

class SmsTemplateSeeder extends Seeder
{
    /**
     * System-wide default templates. restaurant_id/branch_id are null so the
     * templates apply to every restaurant and branch; branches may override
     * them with their own copies.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Order Confirmation',
                'channel' => 'sms',
                'body' => 'Dear {customer}, your order #{order_id} has been received and is being prepared. Thank you for choosing {restaurant_name}!',
                'is_active' => true,
            ],
            [
                'name' => 'Order Ready',
                'channel' => 'sms',
                'body' => 'Dear {customer}, your order #{order_id} is ready. We look forward to serving you at {restaurant_name}.',
                'is_active' => true,
            ],
            [
                'name' => 'Reservation Confirmation',
                'channel' => 'sms',
                'body' => 'Dear {customer}, your reservation at {restaurant_name} is confirmed for {date} at {time}. Table: {table}.',
                'is_active' => true,
            ],
            [
                'name' => 'Promotional Offer',
                'channel' => 'sms',
                'body' => '{restaurant_name} has an offer just for you: {offer}. Visit us today!',
                'is_active' => false,
            ],
            [
                'name' => 'Order Confirmation',
                'channel' => 'whatsapp',
                'body' => 'Dear {customer}, your order #{order_id} has been received and is being prepared. Thank you for choosing {restaurant_name}!',
                'is_active' => true,
            ],
            [
                'name' => 'Order Ready',
                'channel' => 'whatsapp',
                'body' => 'Dear {customer}, your order #{order_id} is ready. We look forward to serving you at {restaurant_name}.',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            SmsTemplate::withoutGlobalScopes()->firstOrCreate(
                [
                    'restaurant_id' => null,
                    'branch_id' => null,
                    'name' => $template['name'],
                    'channel' => $template['channel'],
                ],
                $template
            );
        }
    }
}
