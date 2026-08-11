<?php

use Illuminate\Support\Facades\Route;
use Modules\Installer\Http\Controllers\InstallerController;

Route::prefix('install')->name('installer.')->middleware(['web'])->group(function () {
    Route::get('/', [InstallerController::class, 'index'])->name('index');
    Route::post('/requirements', [InstallerController::class, 'postRequirements'])->name('requirements.post');
    Route::get('/permissions', [InstallerController::class, 'permissions'])->name('permissions');
    Route::post('/permissions', [InstallerController::class, 'postPermissions'])->name('permissions.post');
    Route::get('/environment', [InstallerController::class, 'environment'])->name('environment');
    Route::post('/environment', [InstallerController::class, 'postEnvironment'])->name('environment.post');
    Route::get('/admin', [InstallerController::class, 'admin'])->name('admin');
    Route::post('/admin', [InstallerController::class, 'postAdmin'])->name('admin.post');
    Route::get('/complete', [InstallerController::class, 'complete'])->name('complete');
});
