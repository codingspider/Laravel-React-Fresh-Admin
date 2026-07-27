<?php

use Illuminate\Support\Facades\Route;
use Modules\Menu\Http\Controllers\MenuCategoryController;
use Modules\Menu\Http\Controllers\MenuItemController;
use Modules\Menu\Http\Controllers\ModifierGroupController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('menu/categories/tree', [MenuCategoryController::class, 'tree']);
    Route::apiResource('menu/categories', MenuCategoryController::class);
    Route::apiResource('menu/items', MenuItemController::class);
    Route::apiResource('menu/modifier-groups', ModifierGroupController::class);
});
