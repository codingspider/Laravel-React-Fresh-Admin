<?php

namespace Modules\KitchenDisplay\Providers;

use Illuminate\Support\ServiceProvider;

class KitchenDisplayServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'KitchenDisplay';
    protected string $moduleNameLower = 'kitchendisplay';

    public function register(): void
    {
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
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
