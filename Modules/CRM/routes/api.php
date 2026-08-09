<?php

use Illuminate\Support\Facades\Route;
use Modules\CRM\Http\Controllers\CrmCustomerController;
use Modules\CRM\Http\Controllers\CrmDashboardController;
use Modules\CRM\Http\Controllers\FollowUpController;
use Modules\CRM\Http\Controllers\NoteController;
use Modules\CRM\Http\Controllers\SegmentController;

Route::prefix('v1/crm')->middleware(['auth:sanctum', 'throttle:120,1', 'restaurant.scope', 'module.access'])->group(function () {
    // CRM Dashboard
    Route::get('dashboard', [CrmDashboardController::class, 'index']);

    // Customers (CRM-enhanced list + 360 view)
    Route::get('customers', [CrmCustomerController::class, 'index']);
    Route::post('customers', [CrmCustomerController::class, 'store']);
    Route::get('customers/{id}', [CrmCustomerController::class, 'show']);
    Route::put('customers/{id}', [CrmCustomerController::class, 'update']);
    Route::delete('customers/{id}', [CrmCustomerController::class, 'destroy']);

    // Customer notes timeline
    Route::get('customers/{customer}/notes', [NoteController::class, 'index']);
    Route::post('customers/{customer}/notes', [NoteController::class, 'store']);
    Route::delete('notes/{id}', [NoteController::class, 'destroy']);

    // Segments
    Route::get('segments/all', [SegmentController::class, 'all']);
    Route::get('segments', [SegmentController::class, 'index']);
    Route::post('segments', [SegmentController::class, 'store']);
    Route::get('segments/{id}', [SegmentController::class, 'show']);
    Route::put('segments/{id}', [SegmentController::class, 'update']);
    Route::delete('segments/{id}', [SegmentController::class, 'destroy']);
    Route::post('segments/{id}/customers', [SegmentController::class, 'assignCustomers']);

    // Follow-ups
    Route::get('follow-ups', [FollowUpController::class, 'index']);
    Route::post('follow-ups', [FollowUpController::class, 'store']);
    Route::put('follow-ups/{id}', [FollowUpController::class, 'update']);
    Route::delete('follow-ups/{id}', [FollowUpController::class, 'destroy']);
    Route::post('follow-ups/{id}/complete', [FollowUpController::class, 'complete']);
});
