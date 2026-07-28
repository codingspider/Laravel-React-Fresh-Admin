<?php

namespace Modules\Plan\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Modules\Plan\Repositories\PlanRepository;
use Modules\Plan\Services\PlanService;
use Modules\Plan\Models\Plan;

class PlanServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Plan';
    protected string $nameLower = 'plan';

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

        $this->app->bind(PlanRepository::class, function () {
            return new PlanRepository(new Plan());
        });

        $this->app->bind(PlanService::class, function ($app) {
            return new PlanService($app->make(PlanRepository::class));
        });
    }
}
