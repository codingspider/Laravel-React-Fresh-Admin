<?php

use Illuminate\Support\Facades\Route;
use Modules\TableManagement\Http\Controllers\TableManagementController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('tablemanagements', TableManagementController::class)->names('tablemanagement');
});
