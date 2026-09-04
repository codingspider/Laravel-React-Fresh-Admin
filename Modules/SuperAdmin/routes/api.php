<?php

use Illuminate\Support\Facades\Route;
use Modules\SuperAdmin\Http\Controllers\FaqController;
use Modules\SuperAdmin\Http\Controllers\SuperAdminController;
use Modules\SuperAdmin\Http\Controllers\DashboardController;
use Modules\SuperAdmin\Http\Controllers\WebsiteSettingController;
use Modules\SuperAdmin\Http\Controllers\StripeSettingController;
use Modules\SuperAdmin\Http\Controllers\ReportsController;

// Public front website routes — no authentication required
Route::prefix('api/v1')->middleware(['api', 'cookie.filter'])->group(function () {
    Route::get('website/settings', [WebsiteSettingController::class, 'index']);
    Route::get('faqs', [FaqController::class, 'index']);
});

// Authenticated super admin routes
Route::prefix('api/v1')->middleware(['api', 'cookie.filter', 'auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::apiResource('superadmins', SuperAdminController::class);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/platform-stats', [DashboardController::class, 'platformStats']);
    Route::put('website/settings', [WebsiteSettingController::class, 'update']);

    // Stripe payment settings — super admin only
    Route::get('stripe/settings', [StripeSettingController::class, 'index']);
    Route::put('stripe/settings', [StripeSettingController::class, 'update']);

    // FAQ management — super admin only (checked inside the controller)
    Route::get('faqs/all', [FaqController::class, 'adminIndex']);
    Route::get('faqs/{faq}', [FaqController::class, 'show'])->where('faq', '[0-9]+');
    Route::post('faqs', [FaqController::class, 'store']);
    Route::put('faqs/{faq}', [FaqController::class, 'update'])->where('faq', '[0-9]+');
    Route::delete('faqs/{faq}', [FaqController::class, 'destroy'])->where('faq', '[0-9]+');

    // Reports — super admin only
    Route::get('reports/overview', [ReportsController::class, 'overview']);
    Route::get('reports/packages', [ReportsController::class, 'packageReport']);
    Route::get('reports/plans', [ReportsController::class, 'planReport']);
    Route::get('reports/subscriptions', [ReportsController::class, 'subscriptionReport']);
    Route::get('reports/restaurants', [ReportsController::class, 'restaurantReport']);
});
