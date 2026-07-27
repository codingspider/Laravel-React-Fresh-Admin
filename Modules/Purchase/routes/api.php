<?php

use Illuminate\Support\Facades\Route;
use Modules\Purchase\Http\Controllers\PurchaseController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('purchases', PurchaseController::class);
});
