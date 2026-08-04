<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = new \Modules\Accounting\Services\AccountService();
$restaurantId = \Modules\Restaurant\Models\Restaurant::first()->id;
$service->seedDefaultAccounts($restaurantId);
echo 'Default accounts seeded for restaurant ID: ' . $restaurantId;
echo 'Total accounts: ' . \Modules\Accounting\Models\Account::where('restaurant_id', $restaurantId)->count();
