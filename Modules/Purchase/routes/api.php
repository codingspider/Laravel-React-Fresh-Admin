<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\PurchaseController;

Route::prefix('api')->middleware(['api', 'auth:sanctum', 'throttle:60,1', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::apiResource('purchases', PurchaseController::class);

    // Purchases - GRN / payments / returns
    Route::post('purchases/{id}/receive-goods', [PurchaseController::class, 'receiveGoods']);
    Route::post('purchases/{id}/payments', [PurchaseController::class, 'addPayment']);
    Route::get('purchases/{id}/payments', [PurchaseController::class, 'payments']);
    Route::post('purchases/{id}/returns', [PurchaseController::class, 'createReturn']);
    Route::get('purchases/{id}/returns', [PurchaseController::class, 'returns']);
});
