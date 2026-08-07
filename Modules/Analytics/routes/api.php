<?php

use Illuminate\Support\Facades\Route;
use Modules\Analytics\Http\Controllers\AnalyticsController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:60,1'])->group(function () {
    Route::apiResource('analyticss', AnalyticsController::class);
});

