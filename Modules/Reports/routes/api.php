<?php

use Illuminate\Support\Facades\Route;
use Modules\Reports\Http\Controllers\ReportsController;

Route::prefix('api/v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('reportss', ReportsController::class);
});
