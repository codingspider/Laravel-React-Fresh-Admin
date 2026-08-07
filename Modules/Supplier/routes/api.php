<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\SupplierController;
use App\Http\Controllers\API\Admin\SupplierCrmController;

Route::prefix('api')->middleware(['api', 'auth:sanctum', 'throttle:60,1', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::apiResource('suppliers', SupplierController::class);

    // Supplier CRM
    Route::get('suppliers/{id}/overview', [SupplierCrmController::class, 'overview']);
    Route::get('suppliers/{id}/contacts', [SupplierCrmController::class, 'contacts']);
    Route::post('suppliers/{id}/contacts', [SupplierCrmController::class, 'storeContact']);
    Route::delete('suppliers/{id}/contacts/{contactId}', [SupplierCrmController::class, 'destroyContact']);
    Route::get('suppliers/{id}/documents', [SupplierCrmController::class, 'documents']);
    Route::post('suppliers/{id}/documents', [SupplierCrmController::class, 'storeDocument']);
    Route::delete('suppliers/{id}/documents/{documentId}', [SupplierCrmController::class, 'destroyDocument']);
    Route::get('suppliers/{id}/transactions', [SupplierCrmController::class, 'transactions']);
    Route::post('suppliers/{id}/transactions', [SupplierCrmController::class, 'storeTransaction']);
    Route::post('suppliers/{id}/rate', [SupplierCrmController::class, 'rate']);
});
