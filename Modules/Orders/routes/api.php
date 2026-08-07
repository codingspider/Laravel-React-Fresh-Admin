<?php

use Illuminate\Support\Facades\Route;
use Modules\Orders\Http\Controllers\OrdersController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:60,1', 'restaurant.scope', 'module.access'])->group(function () {
    Route::apiResource('orderss', OrdersController::class);
});

