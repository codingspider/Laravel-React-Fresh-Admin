<?php

use Illuminate\Support\Facades\Route;
use Modules\KitchenDisplay\Http\Controllers\KitchenDisplayController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('kitchendisplays', KitchenDisplayController::class);
});
