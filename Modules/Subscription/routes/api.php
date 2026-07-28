<?php

use Illuminate\Support\Facades\Route;
use Modules\Subscription\Http\Controllers\API\SubscriptionController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('subscription/modules', function (\Illuminate\Http\Request $request) {
        $user = $request->user();

        if (isSuperAdmin($user)) {
            return response()->json([
                'status' => 'success',
                'message' => 'Modules fetched successfully.',
                'data' => ['modules' => []],
            ]);
        }

        $restaurantId = getRestaurantId($user);
        if (!$restaurantId) {
            return response()->json([
                'status' => 'success',
                'message' => 'Modules fetched successfully.',
                'data' => ['modules' => []],
            ]);
        }

        $subscription = \Modules\Subscription\Models\Subscription::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan.packages')
            ->first();

        if (!$subscription) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active subscription.',
                'data' => ['modules' => []],
            ], 403);
        }

        $allowedModules = [];
        foreach ($subscription->plan->packages as $package) {
            $allowedModules = array_merge($allowedModules, $package->modules ?? []);
        }
        $allowedModules = array_unique($allowedModules);

        return response()->json([
            'status' => 'success',
            'message' => 'Modules fetched successfully.',
            'data' => [
                'modules' => array_values($allowedModules),
                'subscription_id' => $subscription->id,
                'plan' => $subscription->plan->name,
            ],
        ]);
    });

    Route::get('subscriptions/{id}/modules', [SubscriptionController::class, 'getModules']);
    Route::apiResource('subscriptions', SubscriptionController::class);
});
