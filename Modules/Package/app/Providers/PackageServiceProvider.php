<?php

namespace Modules\Package\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Modules\Package\Repositories\PackageRepository;
use Modules\Package\Services\PackageService;
use Modules\Package\Models\Package;

class PackageServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Package';
    protected string $nameLower = 'package';

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

        $this->app->bind(PackageRepository::class, function () {
            return new PackageRepository(new Package());
        });

        $this->app->bind(PackageService::class, function ($app) {
            return new PackageService($app->make(PackageRepository::class));
        });
    }
}
