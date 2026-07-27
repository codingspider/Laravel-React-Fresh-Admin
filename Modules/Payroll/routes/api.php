<?php

use Illuminate\Support\Facades\Route;
use Modules\Payroll\Http\Controllers\PayrollController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('payrolls', PayrollController::class);
});
