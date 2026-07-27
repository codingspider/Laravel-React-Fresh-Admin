<?php

use Illuminate\Support\Facades\Route;
use Modules\HRM\Http\Controllers\HRMController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('hrms', HRMController::class);
});
