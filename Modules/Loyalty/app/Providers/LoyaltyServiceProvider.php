<?php

namespace Modules\Loyalty\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider;
use Illuminate\Support\Facades\Route;
use Modules\Loyalty\Listeners\EarnLoyaltyPoints;
use Modules\Loyalty\Listeners\HandleLoyaltyPayment;
use Modules\Loyalty\Listeners\RestoreLoyaltyPoints;
use Modules\POS\Events\PaymentProcessed;
use Modules\POS\Events\SaleCompleted;
use Modules\POS\Events\SaleRefunded;

class LoyaltyServiceProvider extends EventServiceProvider
{
    protected string $moduleName = 'Loyalty';
    protected string $moduleNameLower = 'loyalty';

    protected $listen = [
        PaymentProcessed::class => [
            HandleLoyaltyPayment::class,
        ],
        SaleCompleted::class => [
            EarnLoyaltyPoints::class,
        ],
        SaleRefunded::class => [
            RestoreLoyaltyPoints::class,
        ],
    ];

    public function boot(): void
    {
        Route::middleware('api')->prefix('api')->name('api.')->group(function () {
            $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
        });
        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        $this->loadTranslationsFrom(__DIR__ . '/../../lang', $this->moduleNameLower);
    }

    public function getModuleName(): string
    {
        return $this->moduleName;
    }

    public function getModuleNameLower(): string
    {
        return $this->moduleNameLower;
    }
}
