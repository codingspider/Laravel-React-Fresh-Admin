<?php

namespace Modules\Currency\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Modules\Currency\Repositories\CurrencyRepository;
use Modules\Currency\Services\CurrencyService;
use Modules\Currency\Models\Currency;

class CurrencyServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Currency';
    protected string $nameLower = 'currency';

    protected array $providers = [
        RouteServiceProvider::class,
    ];

    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__ . '/../../lang', $this->nameLower);
    }

    public function register(): void
    {
        parent::register();

        $this->app->bind(CurrencyRepository::class, function () {
            return new CurrencyRepository(new Currency());
        });

        $this->app->bind(CurrencyService::class, function ($app) {
            return new CurrencyService($app->make(CurrencyRepository::class));
        });
    }
}
