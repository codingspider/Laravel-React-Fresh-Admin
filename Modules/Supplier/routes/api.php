<?php

use Illuminate\Support\Facades\Route;
use Modules\Supplier\Http\Controllers\SupplierController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('suppliers', SupplierController::class);
});
