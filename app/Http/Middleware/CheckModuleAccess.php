<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Restaurant\Models\Restaurant;
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

        $restaurant = Restaurant::find($restaurantId);
        if (!$restaurant) {
            return $next($request);
        }

        if (!$restaurant->isActive()) {
            return response()->json([
                'status' => 'error',
                'code' => 'restaurant_inactive',
                'message' => 'Your restaurant is inactive. Please contact support.',
            ], 403);
        }

        $subscription = Subscription::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan.packages')
            ->first();

        if ($subscription) {
            if ($subscription->cancelled_at && $subscription->cancelled_at->isPast()) {
                return response()->json([
                    'status' => 'error',
                    'code' => 'subscription_cancelled',
                    'message' => 'Your subscription has been cancelled. Please renew.',
                ], 403);
            }

            $now = now();
            $daysRemaining = 0;
            
            if ($subscription->is_trial && $subscription->trial_ends_at) {
                if ($subscription->trial_ends_at->isFuture()) {
                    $daysRemaining = $subscription->trial_ends_at->diffInDays($now);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'code' => 'trial_expired',
                        'message' => 'Your trial period has expired. Please subscribe to continue.',
                        'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
                    ], 403);
                }
            } elseif ($subscription->ends_at) {
                if ($subscription->ends_at->isFuture()) {
                    $daysRemaining = $subscription->ends_at->diffInDays($now);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'code' => 'subscription_expired',
                        'message' => 'Your subscription has expired. Please renew to continue.',
                        'ends_at' => $subscription->ends_at->toISOString(),
                    ], 403);
                }
            }

            $user->subscription_days_remaining = $daysRemaining;
            $request->merge(['days_remaining' => $daysRemaining]);

            $allowedModules = [];
            foreach ($subscription->plan->packages as $package) {
                $allowedModules = array_merge($allowedModules, $package->modules ?? []);
            }
            $allowedModules = array_unique($allowedModules);

            $request->merge(['_allowed_modules' => $allowedModules]);
            $user->_allowed_modules = $allowedModules;

            return $next($request);
        }

        if ($restaurant->trial_ends_at && $restaurant->trial_ends_at->isFuture()) {
            $request->merge(['_allowed_modules' => []]);
            $user->_allowed_modules = [];

            return $next($request);
        }

        return response()->json([
            'status' => 'error',
            'code' => 'no_subscription',
            'message' => 'No active subscription. Please subscribe to continue.',
        ], 403);
    }
}
