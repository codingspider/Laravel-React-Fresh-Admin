<?php

use Illuminate\Support\Facades\Route;
use Modules\Shift\Http\Controllers\ShiftController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('shifts', ShiftController::class);
});
