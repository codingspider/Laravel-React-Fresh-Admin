<?php

use Illuminate\Support\Facades\Route;
use Modules\Inventory\Http\Controllers\InventoryController;

Route::prefix('api/v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('inventorys', InventoryController::class);
});
