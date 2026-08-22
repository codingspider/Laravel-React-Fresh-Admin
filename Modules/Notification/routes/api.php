<?php

use Illuminate\Support\Facades\Route;
use Modules\Notification\Http\Controllers\NotificationController;
use Modules\Notification\Http\Controllers\NotificationSettingController;
use Modules\Notification\Http\Controllers\SmsTemplateController;

Route::prefix('v1')->middleware(['cookie.filter','auth:sanctum','throttle:120,1', 'restaurant.scope', 'module.access'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::put('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('notifications/read-all', [NotificationController::class, 'clearRead'])->name('notifications.clear-read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::get('notification/settings', [NotificationSettingController::class, 'show'])->name('notification.settings.show');
    Route::put('notification/settings', [NotificationSettingController::class, 'update'])->name('notification.settings.update');
    Route::post('notification/test-send', [NotificationSettingController::class, 'testSend'])->name('notification.settings.test-send');
    Route::post('notification/test-email', [NotificationSettingController::class, 'testEmail'])->name('notification.settings.test-email');

    Route::get('sms-templates', [SmsTemplateController::class, 'index'])->name('sms-templates.index');
    Route::post('sms-templates', [SmsTemplateController::class, 'store'])->name('sms-templates.store');
    Route::put('sms-templates/{template}', [SmsTemplateController::class, 'update'])->name('sms-templates.update');
    Route::delete('sms-templates/{template}', [SmsTemplateController::class, 'destroy'])->name('sms-templates.destroy');
});

