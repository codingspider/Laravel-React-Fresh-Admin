<?php

use Illuminate\Support\Facades\Route;
use Modules\Loyalty\Http\Controllers\LoyaltyController;

Route::prefix('v1')->middleware(['auth:sanctum', 'restaurant.scope', 'module.access'])->group(function () {
    Route::get('loyalty/settings', [LoyaltyController::class, 'settings'])->name('loyalty.settings');
    Route::put('loyalty/settings', [LoyaltyController::class, 'updateSettings'])->name('loyalty.settings.update');
    Route::get('loyalty/customers', [LoyaltyController::class, 'customers'])->name('loyalty.customers');
    Route::get('loyalty/points', [LoyaltyController::class, 'points'])->name('loyalty.points');
    Route::get('loyalty/transactions', [LoyaltyController::class, 'transactions'])->name('loyalty.transactions');
    Route::post('loyalty/points/adjust', [LoyaltyController::class, 'adjust'])->name('loyalty.points.adjust');
    Route::post('loyalty/redeem/preview', [LoyaltyController::class, 'redeemPreview'])->name('loyalty.redeem.preview');
});
