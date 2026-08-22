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
        $middleware->append(\App\Http\Middleware\LogActivity::class);

        $middleware->alias([
            'check_active_business' => \App\Http\Middleware\CheckBusinessIsActive::class,
            'cookie.filter' => \App\Http\Middleware\CookieFilter::class,
            'restaurant.scope' => \App\Http\Middleware\RestaurantScope::class,
            'module.access' => \App\Http\Middleware\CheckModuleAccess::class,
            'permission.check' => \App\Http\Middleware\CheckPermission::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        ]);

        $middleware->priority([
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\CookieFilter::class,
        ]);

        $middleware->encryptCookies(except: ['access_token']);

        $middleware->statefulApi();
        $middleware->prependToGroup('api', \App\Http\Middleware\CookieFilter::class);
        $middleware->appendToGroup('api', \App\Http\Middleware\CheckPermission::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
