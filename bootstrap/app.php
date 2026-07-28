<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check_active_business' => \App\Http\Middleware\CheckBusinessIsActive::class,
            'cookie.filter' => \App\Http\Middleware\CookieFilter::class,
            'restaurant.scope' => \App\Http\Middleware\RestaurantScope::class,
            'module.access' => \App\Http\Middleware\CheckModuleAccess::class,
        ]);

        $middleware->priority([
            \App\Http\Middleware\CookieFilter::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();

