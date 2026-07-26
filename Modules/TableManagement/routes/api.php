<?php

use Illuminate\Support\Facades\Route;
use Modules\TableManagement\Http\Controllers\TableManagementController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('tablemanagements', TableManagementController::class)->names('tablemanagement');
});
