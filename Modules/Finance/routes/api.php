<?php

use Illuminate\Support\Facades\Route;
use Modules\Finance\Http\Controllers\FinanceController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:120,1'])->group(function () {
    Route::apiResource('finances', FinanceController::class);
});

