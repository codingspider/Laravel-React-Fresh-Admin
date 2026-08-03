<?php

use Illuminate\Support\Facades\Route;
use Modules\Restaurant\Http\Controllers\RestaurantController;
use App\Http\Controllers\API\Admin\BusinessController as AdminBusinessController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('restaurants', [RestaurantController::class, 'index']);
    Route::post('restaurants', [RestaurantController::class, 'store']);
    Route::get('restaurants/{restaurant}', [RestaurantController::class, 'show']);
    Route::put('restaurants/{restaurant}', [RestaurantController::class, 'update']);
    Route::delete('restaurants/{restaurant}', [RestaurantController::class, 'destroy']);
    Route::put('restaurants/{restaurant}/working-hours', [RestaurantController::class, 'updateWorkingHours']);
    Route::put('restaurants/{restaurant}/tax-settings', [RestaurantController::class, 'updateTaxSettings']);
});

Route::middleware(['auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope', EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::get('owner/business', [AdminBusinessController::class, 'index']);
    Route::put('business/setting/update/{id}', [AdminBusinessController::class, 'update']);
    Route::post('update/currency', [AdminBusinessController::class, 'updateCurrency']);
    Route::post('notification/update', [AdminBusinessController::class, 'updateNotification']);
    Route::post('update/invoice/setting', [AdminBusinessController::class, 'updateInvoiceSetting']);
    Route::get('get/notification/setting', [AdminBusinessController::class, 'getNotificationSetting']);
    Route::get('get/invoice/setting', [AdminBusinessController::class, 'getInvoiceSetting']);
});
