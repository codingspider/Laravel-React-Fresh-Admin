<?php

use Illuminate\Support\Facades\Route;
use Modules\CustomerDisplay\Http\Controllers\CustomerDisplayController;

/*
|--------------------------------------------------------------------------
| Customer Display API Routes
|--------------------------------------------------------------------------
|
| The board route is intentionally public: the monitor is shown on a
| secondary screen for all customers without login. Settings routes require
| an authenticated restaurant user with the relevant permission.
|
*/

// Public board (no authentication)
Route::prefix('v1')->group(function () {
    Route::get('customer-display', [CustomerDisplayController::class, 'board'])->name('customer-display.board');
});

// Protected settings
Route::middleware(['auth:sanctum', 'restaurant.scope', 'module.access'])
    ->prefix('v1')
    ->group(function () {
        Route::get('customer-display/settings', [CustomerDisplayController::class, 'settings'])->name('customer-display.settings');
        Route::put('customer-display/settings', [CustomerDisplayController::class, 'update'])->name('customer-display.settings.update');
    });
