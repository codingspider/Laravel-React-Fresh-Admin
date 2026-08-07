<?php

use Illuminate\Support\Facades\Route;
use Modules\SuperAdmin\Http\Controllers\SuperAdminController;
use Modules\SuperAdmin\Http\Controllers\DashboardController;
use Modules\SuperAdmin\Http\Controllers\WebsiteSettingController;

// Public front website settings — no authentication required
Route::prefix('api/v1')->middleware(['api', 'cookie.filter'])->group(function () {
    Route::get('website/settings', [WebsiteSettingController::class, 'index']);
});

// Authenticated super admin routes
Route::prefix('api/v1')->middleware(['api', 'auth:sanctum', 'cookie.filter'])->group(function () {
    Route::apiResource('superadmins', SuperAdminController::class);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/platform-stats', [DashboardController::class, 'platformStats']);
    Route::put('website/settings', [WebsiteSettingController::class, 'update']);
});
