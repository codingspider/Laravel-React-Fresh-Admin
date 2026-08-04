<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\DepartmentController;
use App\Http\Controllers\API\Admin\DesignationController;
use App\Http\Controllers\API\Admin\EmployeeController;
use App\Http\Controllers\API\Admin\AttendanceController;
use App\Http\Controllers\API\Admin\LeaveController;
use App\Http\Controllers\API\Admin\HolidayController;
use App\Http\Controllers\API\Admin\PayrollController;

Route::prefix('api')->middleware(['api', 'cookie.filter', 'auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('designations', DesignationController::class);
    Route::get('designations/departments/{departmentId}', [DesignationController::class, 'byDepartment']);
    Route::apiResource('employees', EmployeeController::class);
    Route::get('employee/options', [EmployeeController::class, 'options']);
    Route::apiResource('attendance', AttendanceController::class);
    Route::apiResource('leaves', LeaveController::class);
    Route::post('leaves/{id}/approve', [LeaveController::class, 'approve']);
    Route::apiResource('holidays', HolidayController::class);
    Route::apiResource('payrolls', PayrollController::class);
});
