<?php

use Illuminate\Support\Facades\Route;
use Modules\Currency\Http\Controllers\API\CurrencyController;

Route::prefix('v1')->middleware(['cookie.filter','auth:sanctum','throttle:120,1'])->group(function () {
    Route::get('currencies/all-active', [CurrencyController::class, 'allActive']);
    Route::apiResource('currencies', CurrencyController::class);
});

