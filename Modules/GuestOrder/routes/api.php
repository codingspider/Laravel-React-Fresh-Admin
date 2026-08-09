<?php

use Illuminate\Support\Facades\Route;
use Modules\GuestOrder\Http\Controllers\GuestMenuController;
use Modules\GuestOrder\Http\Controllers\GuestOrderController;

Route::prefix('api/guest')->middleware(['throttle:120,1'])->group(function () {
    Route::get('/table/{token}', [GuestMenuController::class, 'table']);
    Route::get('/menu', [GuestMenuController::class, 'menu']);
    Route::post('/order', [GuestOrderController::class, 'store']);
    Route::get('/order/{invoice}', [GuestOrderController::class, 'track']);
});
