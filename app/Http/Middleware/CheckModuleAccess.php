<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Subscription\Models\Subscription;

class CheckModuleAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        if (isSuperAdmin($user)) {
            return $next($request);
        }

        $restaurantId = getRestaurantId($user);
        if (!$restaurantId) {
            return $next($request);
        }

        $subscription = Subscription::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan.packages')
            ->first();

        if (!$subscription) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active subscription.',
            ], 403);
        }

        $allowedModules = [];
        foreach ($subscription->plan->packages as $package) {
            $allowedModules = array_merge($allowedModules, $package->modules ?? []);
        }
        $allowedModules = array_unique($allowedModules);

        $request->merge(['_allowed_modules' => $allowedModules]);
        $user->_allowed_modules = $allowedModules;

        return $next($request);
    }
}
