<?php

use Illuminate\Support\Facades\Route;
use Modules\Delivery\Http\Controllers\DeliveryController;

Route::prefix('api/v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('deliverys', DeliveryController::class);
});
