<?php

namespace Modules\GuestOrder\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\GuestOrder\Services\GuestOrderService;

class GuestOrderServiceProvider extends ServiceProvider
{
    protected string $name = 'GuestOrder';
    protected string $nameLower = 'guestorder';

    public function register(): void
    {
        $this->app->singleton(GuestOrderService::class, function ($app) {
            return new GuestOrderService();
        });
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        $this->loadTranslationsFrom(__DIR__ . '/../../lang', $this->nameLower);
    }
}
