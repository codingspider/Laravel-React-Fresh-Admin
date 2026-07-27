<?php

use Illuminate\Support\Facades\Route;
use Modules\Marketing\Http\Controllers\MarketingController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('marketings', MarketingController::class);
});
