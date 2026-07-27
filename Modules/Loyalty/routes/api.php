<?php

use Illuminate\Support\Facades\Route;
use Modules\Loyalty\Http\Controllers\LoyaltyController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('loyaltys', LoyaltyController::class);
});
