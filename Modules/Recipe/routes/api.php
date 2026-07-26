<?php

use Illuminate\Support\Facades\Route;
use Modules\Recipe\Http\Controllers\RecipeController;

Route::prefix('api/v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('recipes', RecipeController::class);
});
