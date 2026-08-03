<?php

use Illuminate\Support\Facades\Route;
use Modules\Menu\Http\Controllers\MenuCategoryController;
use Modules\Menu\Http\Controllers\MenuItemController;
use Modules\Menu\Http\Controllers\ModifierGroupController;
use App\Http\Controllers\API\Admin\AddonController;
use App\Http\Controllers\API\Admin\CategoryController;
use App\Http\Controllers\API\Admin\VariationController;
use App\Http\Controllers\API\VatController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::prefix('v1')->middleware(['auth:sanctum', 'restaurant.scope', 'module.access'])->group(function () {
    Route::get('menu/categories/tree', [MenuCategoryController::class, 'tree']);
    Route::apiResource('menu/categories', MenuCategoryController::class);
    Route::apiResource('menu/items', MenuItemController::class);
    Route::apiResource('menu/modifier-groups', ModifierGroupController::class);
});

Route::middleware(['auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope', EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('addons', AddonController::class);
    Route::apiResource('variations', VariationController::class);
    Route::apiResource('vats', VatController::class);
});
