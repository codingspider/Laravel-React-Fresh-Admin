<?php

use Illuminate\Support\Facades\Route;
use Modules\Payroll\Http\Controllers\PayrollController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:120,1'])->group(function () {
    Route::apiResource('payrolls', PayrollController::class);
});

