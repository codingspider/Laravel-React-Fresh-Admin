<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Restaurant\Models\Restaurant;

class CheckBusinessIsActive
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethod('get')) {
            return $next($request);
        }

        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $restaurantId = getRestaurantId($user);
        if (!$restaurantId) {
            return $next($request);
        }

        $restaurant = Restaurant::find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.'
            ], 404);
        }

        if (!$restaurant->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Your restaurant is inactive. Please contact support.'
            ], 403);
        }

        return $next($request);
    }
}
