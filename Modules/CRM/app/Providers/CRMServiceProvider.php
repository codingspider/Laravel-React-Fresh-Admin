<?php

namespace Modules\CRM\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider;
use Illuminate\Support\Facades\Route;
use Modules\CRM\Listeners\SyncCustomerFromSale;
use Modules\POS\Events\SaleCompleted;

class CRMServiceProvider extends EventServiceProvider
{
    protected string $moduleName = 'CRM';
    protected string $moduleNameLower = 'crm';

    /**
     * The event handler mappings for the application.
     *
     * @var array<string, array<int, string>>
     */
    protected $listen = [
        SaleCompleted::class => [
            SyncCustomerFromSale::class,
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
