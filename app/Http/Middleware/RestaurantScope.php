<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Restaurant\Models\Restaurant;

class RestaurantScope
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user) {
            if ($user->restaurant_id) {
                $restaurantId = $user->restaurant_id;
            } else {
                $restaurant = Restaurant::where('owner_id', $user->id)->first();
                $restaurantId = $restaurant?->id;
            }
            $request->merge(['_restaurant_id' => $restaurantId]);
            $user->_restaurant_id = $restaurantId;
        }
        return $next($request);
    }
}
