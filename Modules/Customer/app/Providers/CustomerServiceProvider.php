<?php

namespace Modules\Customer\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class CustomerServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Customer';
    protected string $moduleNameLower = 'customer';

    public function register(): void
    {
    }

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
