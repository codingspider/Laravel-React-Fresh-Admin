<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\RecipeController;
use App\Http\Controllers\API\Admin\RecipeCategoryController;

Route::prefix('api')->middleware(['api', 'auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::apiResource('recipes', RecipeController::class);
    Route::apiResource('recipe-categories', RecipeCategoryController::class);
    Route::get('recipe/options', [RecipeController::class, 'options']);
});
