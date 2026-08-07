<?php

use Illuminate\Support\Facades\Route;
use Modules\POS\Http\Controllers\POSController;
use Modules\POS\Http\Controllers\PosSettingController;
use Modules\POS\Http\Controllers\CouponController;

Route::middleware(['auth:sanctum','throttle:60,1', 'restaurant.scope', 'module.access'])->prefix('v1')->group(function () {
    Route::get('pos/settings', [PosSettingController::class, 'index'])->name('pos.settings.index');
    Route::put('pos/settings', [PosSettingController::class, 'update'])->name('pos.settings.update');

    Route::get('pos/coupons', [CouponController::class, 'index'])->name('pos.coupons.index');
    Route::post('pos/coupons', [CouponController::class, 'store'])->name('pos.coupons.store');
    Route::post('pos/coupons/validate', [CouponController::class, 'validateCoupon'])->name('pos.coupons.validate');
    Route::get('pos/coupons/{coupon}', [CouponController::class, 'show'])->name('pos.coupons.show');
    Route::put('pos/coupons/{coupon}', [CouponController::class, 'update'])->name('pos.coupons.update');
    Route::delete('pos/coupons/{coupon}', [CouponController::class, 'destroy'])->name('pos.coupons.destroy');

    Route::post('pos/sessions/start', [POSController::class, 'startSession'])->name('pos.sessions.start');
    Route::post('pos/sessions/{id}/close', [POSController::class, 'closeSession'])->name('pos.sessions.close');
    Route::get('pos/sessions/open', [POSController::class, 'getOpenSession'])->name('pos.sessions.open');

    Route::get('pos', [POSController::class, 'index'])->name('pos.index');
    Route::post('pos', [POSController::class, 'store'])->name('pos.store');
    Route::get('pos/held', [POSController::class, 'getHeldOrders'])->name('pos.held');
    Route::get('pos/{id}', [POSController::class, 'show'])->name('pos.show');
    Route::post('pos/merge', [POSController::class, 'mergeBills'])->name('pos.merge');
    Route::post('pos/{saleId}/payments', [POSController::class, 'processPayment'])->name('pos.payments');
    Route::post('pos/{saleId}/payments/multiple', [POSController::class, 'processMultiplePayments'])->name('pos.payments.multiple');
    Route::post('pos/{saleId}/refund', [POSController::class, 'processRefund'])->name('pos.refund');
    Route::post('pos/{id}/hold', [POSController::class, 'holdOrder'])->name('pos.hold');
    Route::post('pos/{id}/recall', [POSController::class, 'recallOrder'])->name('pos.recall');
    Route::post('pos/{id}/cancel', [POSController::class, 'cancelSale'])->name('pos.cancel');
    Route::post('pos/{saleId}/items', [POSController::class, 'addItem'])->name('pos.items.add');
    Route::delete('pos/{saleId}/items/{itemId}', [POSController::class, 'removeItem'])->name('pos.items.remove');
});

