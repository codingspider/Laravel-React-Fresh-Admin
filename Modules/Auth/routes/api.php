<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\UserManagementController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('auths', AuthController::class)->names('auth');
});

Route::middleware(['auth:sanctum','throttle:60,1', 'check_active_business', 'module.access', 'restaurant.scope', EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('user-management', UserManagementController::class);
});

