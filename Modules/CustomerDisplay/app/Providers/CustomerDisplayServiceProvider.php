<?php

namespace Modules\CustomerDisplay\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Nwidart\Modules\Support\ModuleServiceProvider;

class CustomerDisplayServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'CustomerDisplay';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'customersdisplay';

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
        $this->mergeConfigFrom(__DIR__ . '/../../config/config.php', $this->nameLower);

        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');

        $this->loadTranslationsFrom(__DIR__ . '/../../lang', $this->nameLower);
    }
}
