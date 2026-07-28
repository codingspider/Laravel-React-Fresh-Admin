<?php

namespace Modules\Subscription\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Modules\Subscription\Repositories\SubscriptionRepository;
use Modules\Subscription\Services\SubscriptionService;
use Modules\Subscription\Models\Subscription;

class SubscriptionServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Subscription';
    protected string $nameLower = 'subscription';

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

        $this->app->bind(SubscriptionRepository::class, function () {
            return new SubscriptionRepository(new Subscription());
        });

        $this->app->bind(SubscriptionService::class, function ($app) {
            return new SubscriptionService($app->make(SubscriptionRepository::class));
        });
    }
}
