<?php

use Illuminate\Support\Facades\Route;
use Modules\KOT\Http\Controllers\KOTController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:120,1'])->group(function () {
    Route::apiResource('kots', KOTController::class);
});

