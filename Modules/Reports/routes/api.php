<?php

use Illuminate\Support\Facades\Route;
use Modules\Reports\Http\Controllers\ReportsController;
use Modules\Reports\Http\Controllers\ReportController;

Route::prefix('api')->middleware(['api', 'cookie.filter', 'auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::apiResource('reportss', ReportsController::class);

    Route::get('reports/meta', [ReportController::class, 'meta']);
    Route::get('reports/sales', [ReportController::class, 'saleReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchaseReport']);
    Route::get('reports/taxes', [ReportController::class, 'taxReport']);
    Route::get('reports/expenses', [ReportController::class, 'expenseReport']);
});
