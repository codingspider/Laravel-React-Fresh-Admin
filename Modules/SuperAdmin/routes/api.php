<?php

use Illuminate\Support\Facades\Route;
use Modules\SuperAdmin\Http\Controllers\SuperAdminController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('superadmins', SuperAdminController::class);
});
