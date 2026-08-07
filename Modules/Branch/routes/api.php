<?php

use Illuminate\Support\Facades\Route;
use Modules\Branch\Http\Controllers\BranchController;
use App\Http\Controllers\API\BranchController as AppBranchController;
use App\Http\Controllers\API\Admin\AddonController;
use App\Http\Controllers\API\Admin\CategoryController;
use App\Http\Controllers\API\Admin\VariationController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::prefix('v1')->middleware(['auth:sanctum','throttle:60,1', 'restaurant.scope', 'module.access'])->group(function () {
    Route::get('branches', [BranchController::class, 'index']);
    Route::post('branches', [BranchController::class, 'store']);
    Route::get('branches/{branch}', [BranchController::class, 'show']);
    Route::put('branches/{branch}', [BranchController::class, 'update']);
    Route::delete('branches/{branch}', [BranchController::class, 'destroy']);
});

Route::middleware(['auth:sanctum','throttle:60,1', 'check_active_business', 'module.access', 'restaurant.scope', EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::get('get/all/addons', [AddonController::class, 'getAllAddons']);
    Route::get('get/all/variations', [VariationController::class, 'getAllVariations']);
    Route::get('get/all/categories', [CategoryController::class, 'getAllCategory']);
});

Route::middleware(['auth:sanctum','throttle:60,1', 'check_active_business', 'restaurant.scope', 'cookie.filter'])->group(function () {
    Route::get('get/branches', [AppBranchController::class, 'getBranch']);
});
