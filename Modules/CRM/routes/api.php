<?php

use Illuminate\Support\Facades\Route;
use Modules\CRM\Http\Controllers\CRMController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('crms', CRMController::class);
});
