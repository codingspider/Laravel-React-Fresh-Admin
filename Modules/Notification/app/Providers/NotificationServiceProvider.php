<?php

namespace Modules\Notification\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider;
use Illuminate\Support\Facades\Route;
use Modules\Notification\Events\LowStockAlert;
use Modules\Notification\Listeners\NotifyGuestOrderConfirmation;
use Modules\Notification\Listeners\NotifyLowStock;
use Modules\Notification\Listeners\NotifySaleCompleted;
use Modules\Notification\Listeners\NotifySaleRefunded;
use Modules\POS\Events\SaleCompleted;
use Modules\POS\Events\SaleRefunded;

class NotificationServiceProvider extends EventServiceProvider
{
    protected string $moduleName = 'Notification';
    protected string $moduleNameLower = 'notification';

    protected $listen = [
        SaleCompleted::class => [
            NotifySaleCompleted::class,
            NotifyGuestOrderConfirmation::class,
        ],
        SaleRefunded::class => [
            NotifySaleRefunded::class,
        ],
        LowStockAlert::class => [
            NotifyLowStock::class,
        ],
    ];

    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/config.php', $this->moduleNameLower);

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
