<?php

use Illuminate\Support\Facades\Route;
use Modules\Restaurant\Http\Controllers\RestaurantController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('restaurants', [RestaurantController::class, 'index']);
    Route::post('restaurants', [RestaurantController::class, 'store']);
    Route::get('restaurants/{restaurant}', [RestaurantController::class, 'show']);
    Route::put('restaurants/{restaurant}', [RestaurantController::class, 'update']);
    Route::delete('restaurants/{restaurant}', [RestaurantController::class, 'destroy']);
    Route::put('restaurants/{restaurant}/working-hours', [RestaurantController::class, 'updateWorkingHours']);
    Route::put('restaurants/{restaurant}/tax-settings', [RestaurantController::class, 'updateTaxSettings']);
});
