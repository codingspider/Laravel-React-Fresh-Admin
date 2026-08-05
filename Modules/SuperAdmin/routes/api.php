<?php

use Illuminate\Support\Facades\Route;
use Modules\SuperAdmin\Http\Controllers\SuperAdminController;
use Modules\SuperAdmin\Http\Controllers\DashboardController;

Route::prefix('api/v1')->middleware(['api', 'auth:sanctum', 'cookie.filter'])->group(function () {
    Route::apiResource('superadmins', SuperAdminController::class);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
});
