<?php

namespace Modules\KitchenDisplay\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Nwidart\Modules\Support\ModuleServiceProvider;

class KitchenDisplayServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'KitchenDisplay';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'kitchendisplay';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    // protected array $commands = [];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        RouteServiceProvider::class,
    ];

    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/config.php', 'kitchendisplay');

        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');

        $this->loadTranslationsFrom(__DIR__ . '/../../lang', $this->nameLower);
    }
}
