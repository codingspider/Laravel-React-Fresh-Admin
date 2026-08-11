<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        $this->loadViewsFrom(__DIR__ . '/../../Modules/Installer/resources/views', 'installer');
        $this->mergeConfigFrom(__DIR__ . '/../../Modules/Installer/config/config.php', 'installer');
    }
}
