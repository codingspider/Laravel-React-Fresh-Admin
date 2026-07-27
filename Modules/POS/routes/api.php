<?php

use Illuminate\Support\Facades\Route;
use Modules\POS\Http\Controllers\POSController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::post('pos/sessions/start', [POSController::class, 'startSession'])->name('pos.sessions.start');
    Route::post('pos/sessions/{id}/close', [POSController::class, 'closeSession'])->name('pos.sessions.close');
    Route::get('pos/sessions/open', [POSController::class, 'getOpenSession'])->name('pos.sessions.open');

    Route::get('pos', [POSController::class, 'index'])->name('pos.index');
    Route::post('pos', [POSController::class, 'store'])->name('pos.store');
    Route::get('pos/{id}', [POSController::class, 'show'])->name('pos.show');
    Route::post('pos/{saleId}/payments', [POSController::class, 'processPayment'])->name('pos.payments');
    Route::post('pos/{id}/hold', [POSController::class, 'holdOrder'])->name('pos.hold');
    Route::post('pos/{id}/recall', [POSController::class, 'recallOrder'])->name('pos.recall');
    Route::post('pos/{id}/cancel', [POSController::class, 'cancelSale'])->name('pos.cancel');
    Route::post('pos/{saleId}/items', [POSController::class, 'addItem'])->name('pos.items.add');
    Route::delete('pos/{saleId}/items/{itemId}', [POSController::class, 'removeItem'])->name('pos.items.remove');
});
