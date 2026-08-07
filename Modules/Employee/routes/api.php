<?php

use Illuminate\Support\Facades\Route;
use Modules\Employee\Http\Controllers\EmployeeController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:60,1'])->group(function () {
    Route::apiResource('employees', EmployeeController::class);
});

