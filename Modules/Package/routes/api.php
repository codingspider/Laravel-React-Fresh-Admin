<?php

use Illuminate\Support\Facades\Route;
use Modules\Package\Http\Controllers\API\PackageController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('packages', PackageController::class);
});
