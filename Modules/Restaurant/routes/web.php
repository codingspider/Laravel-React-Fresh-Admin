<?php

use Illuminate\Support\Facades\Route;
use Modules\Restaurant\Http\Controllers\RestaurantController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('restaurants', RestaurantController::class)->names('restaurant');
});
