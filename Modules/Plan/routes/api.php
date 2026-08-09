<?php

use Illuminate\Support\Facades\Route;
use Modules\Plan\Http\Controllers\API\PlanController;

Route::prefix('v1')->group(function () {
    // Public landing-page endpoint — no authentication required
    Route::get('plans/pub', [PlanController::class, 'publicIndex']);

    // Authenticated resource routes
    Route::middleware(['auth:sanctum','throttle:120,1'])->group(function () {
        Route::apiResource('plans', PlanController::class);
    });
});

