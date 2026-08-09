<?php

use Illuminate\Support\Facades\Route;
use Modules\Package\Http\Controllers\API\PackageController;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:120,1'])->group(function () {
    Route::apiResource('packages', PackageController::class);
});

