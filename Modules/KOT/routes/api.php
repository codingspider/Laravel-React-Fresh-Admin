<?php

use Illuminate\Support\Facades\Route;
use Modules\KOT\Http\Controllers\KOTController;

Route::prefix('api/v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('kots', KOTController::class);
});
