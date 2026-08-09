<?php

use Illuminate\Support\Facades\Route;
use Modules\KitchenDisplay\Http\Controllers\KitchenDisplayController;

Route::middleware(['auth:sanctum','throttle:120,1', 'restaurant.scope', 'module.access'])
    ->prefix('v1')
    ->group(function () {
        Route::get('kitchen/display', [KitchenDisplayController::class, 'board'])->name('kitchen.display');
        Route::get('kitchen/chefs', [KitchenDisplayController::class, 'chefs'])->name('kitchen.chefs');

        Route::post('kitchen/orders/{saleId}/status', [KitchenDisplayController::class, 'updateStatus'])->name('kitchen.orders.status');
        Route::post('kitchen/orders/{saleId}/priority', [KitchenDisplayController::class, 'setPriority'])->name('kitchen.orders.priority');
        Route::post('kitchen/orders/{saleId}/chef', [KitchenDisplayController::class, 'assignChef'])->name('kitchen.orders.chef');
    });

