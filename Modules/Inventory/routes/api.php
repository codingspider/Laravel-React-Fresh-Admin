<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\InventoryItemController;
use App\Http\Controllers\API\Admin\InventoryCategoryController;
use App\Http\Controllers\API\Admin\InventoryStockController;
use App\Http\Controllers\API\Admin\UnitController;

Route::prefix('api')->middleware(['api', 'auth:sanctum', 'throttle:120,1', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::apiResource('units', UnitController::class);
    Route::apiResource('inventory-items', InventoryItemController::class);
    Route::apiResource('inventory-categories', InventoryCategoryController::class);

    // Inventory stock movements
    Route::get('inventory/overview', [InventoryStockController::class, 'overview']);
    Route::get('inventory/transactions', [InventoryStockController::class, 'transactions']);
    Route::get('inventory/batches', [InventoryStockController::class, 'batches']);
    Route::get('inventory/transfers', [InventoryStockController::class, 'transfers']);
    Route::post('inventory/transfers', [InventoryStockController::class, 'storeTransfer']);
    Route::post('inventory/transfers/{id}/receive', [InventoryStockController::class, 'receiveTransfer']);
    Route::get('inventory/wastes', [InventoryStockController::class, 'wastes']);
    Route::post('inventory/wastes', [InventoryStockController::class, 'storeWaste']);
    Route::get('inventory/adjustments', [InventoryStockController::class, 'adjustments']);
    Route::post('inventory/adjustments', [InventoryStockController::class, 'storeAdjustment']);
    Route::post('inventory/adjustments/{id}/approve', [InventoryStockController::class, 'approveAdjustment']);
    Route::post('inventory/items/{id}/adjust-stock', [InventoryStockController::class, 'adjustStock']);
});
