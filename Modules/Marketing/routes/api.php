<?php

use Illuminate\Support\Facades\Route;
use Modules\Marketing\Http\Controllers\MarketingController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:120,1'])->group(function () {
    Route::apiResource('marketings', MarketingController::class);
});

