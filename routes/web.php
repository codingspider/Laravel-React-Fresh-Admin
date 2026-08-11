<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\InstallerController;

$isInstalled = File::exists(storage_path('installed'));

if (!$isInstalled) {
    Route::get('/install', [InstallerController::class, 'index'])->name('installer.index');
    Route::post('/install/requirements', [InstallerController::class, 'postRequirements'])->name('installer.requirements.post');
    Route::get('/install/permissions', [InstallerController::class, 'permissions'])->name('installer.permissions');
    Route::post('/install/permissions', [InstallerController::class, 'postPermissions'])->name('installer.permissions.post');
    Route::get('/install/environment', [InstallerController::class, 'environment'])->name('installer.environment');
    Route::post('/install/environment', [InstallerController::class, 'postEnvironment'])->name('installer.environment.post');
    Route::get('/install/admin', [InstallerController::class, 'admin'])->name('installer.admin');
    Route::post('/install/admin', [InstallerController::class, 'postAdmin'])->name('installer.admin.post');

    Route::post('/installer/start', [InstallerController::class, 'startInstallation'])->name('installer.start');

    Route::get('/install/progress', [InstallerController::class, 'progress'])->name('installer.progress');
    Route::get('/install/progress/check', [InstallerController::class, 'checkProgress'])->name('installer.progress.check');


    Route::get('/', function () {
        return redirect()->route('installer.index');
    });

    return;
}

Route::get('order', function () {
    return view('guest');
})->name('guest.order');

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|order).+')->middleware('web');
