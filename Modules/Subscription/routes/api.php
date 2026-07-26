<?php

use Illuminate\Support\Facades\Route;
use Modules\Subscription\Http\Controllers\SubscriptionController;

Route::prefix('api/v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('subscriptions', SubscriptionController::class);
});
