<?php

use Illuminate\Support\Facades\Route;
use Modules\Plan\Http\Controllers\API\PlanController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('plans', PlanController::class);
});
