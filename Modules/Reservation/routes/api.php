<?php

use Illuminate\Support\Facades\Route;
use Modules\Reservation\Http\Controllers\ReservationController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('reservations', ReservationController::class);
});
