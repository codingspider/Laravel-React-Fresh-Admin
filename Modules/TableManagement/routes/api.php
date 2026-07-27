<?php

use Illuminate\Support\Facades\Route;
use Modules\TableManagement\Http\Controllers\TableController;
use Modules\TableManagement\Http\Controllers\ReservationController;
use Modules\TableManagement\Http\Controllers\FloorController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('tables/available', [TableController::class, 'available']);
    Route::apiResource('tables', TableController::class);
    Route::put('tables/{table}/status', [TableController::class, 'updateStatus']);

    Route::apiResource('floors', FloorController::class)->except(['update']);

    Route::apiResource('reservations', ReservationController::class);
    Route::put('reservations/{reservation}/confirm', [ReservationController::class, 'confirm']);
    Route::put('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
    Route::put('reservations/{reservation}/seat', [ReservationController::class, 'seat']);
    Route::put('reservations/{reservation}/complete', [ReservationController::class, 'complete']);
    Route::put('reservations/{reservation}/no-show', [ReservationController::class, 'noShow']);
});
