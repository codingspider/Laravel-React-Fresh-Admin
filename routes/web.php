<?php

use Illuminate\Support\Facades\Route;

Route::get('order', function () {
    return view('guest');
})->name('guest.order');

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|order).+')->middleware('web');
