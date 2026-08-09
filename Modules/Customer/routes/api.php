<?php

use Illuminate\Support\Facades\Route;
use Modules\Customer\Http\Controllers\CustomerController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:120,1', 'restaurant.scope', 'module.access'])->group(function () {
    Route::apiResource('customers', CustomerController::class);
});

