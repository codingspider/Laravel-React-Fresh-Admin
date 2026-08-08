<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('backup:run')
    ->dailyAt((string) config('backup.schedule_at', '02:00'))
    ->environments(['production'])
    ->when(fn () => (bool) config('backup.enable_schedule', false))
    ->withoutOverlapping();
