<?php

use App\Http\Controllers\API\Admin\LocationController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BusinessController;
use App\Http\Controllers\API\GeneralController;
use App\Http\Controllers\API\PLanController;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\OcrController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::controller(RegisterController::class)->group(function(){
    Route::post('register', 'register')->middleware(['web']);
    Route::post('login', 'login')->middleware(['web']);
    Route::post('forgot-password', 'forgotPassword')->middleware(['web']);
    Route::post('reset-password', 'resetPassword')->middleware(['web']);
    Route::post('store/business/info', 'storeBusinessInfo')->middleware(['web']);
});

Route::middleware(['auth:sanctum', EnsureFrontendRequestsAreStateful::class])->prefix('superadmin')->group(function () {
    // Add more super admin routes here
    Route::get('users', [UserController::class, 'index']);
    Route::post('user/store', [UserController::class, 'store']);
    Route::resource('plans', PLanController::class);
    Route::resource('business', BusinessController::class);
    Route::get('get/all/plans', [GeneralController::class, 'getAllPlan']);
    
});

Route::middleware(['auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope', EnsureFrontendRequestsAreStateful::class])->group(function () {
    // Admin module routes have been distributed to their respective modules.
});

Route::middleware(['auth:sanctum', 'check_active_business', 'restaurant.scope', 'cookie.filter'])->group(function () {
    Route::get('get/currencies', [GeneralController::class, 'getCurrency']);
    Route::get('get/timezones', [GeneralController::class, 'getTimezone']);
    Route::get('get/locations', [LocationController::class, 'getAllLocations']);
    Route::get('get/roles', [RoleController::class, 'getAllRole']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/set-permission', [AuthController::class, 'giveAllPermissionsToAdmin']);
    Route::post('/extract-text-from-image', [OcrController::class, 'extract']);

    
});

Route::middleware(['auth:sanctum', 'cookie.filter'])->get('/user', function (Request $request) {
    $user = $request->user();
    $restaurant = null;
    $subscription = null;
    $trialEndsAt = null;
    $subscriptionStatus = 'none';

    if ($user->restaurant_id) {
        $restaurant = \Modules\Restaurant\Models\Restaurant::find($user->restaurant_id);
    } else {
        $restaurant = \Modules\Restaurant\Models\Restaurant::where('owner_id', $user->id)->first();
    }

    if ($restaurant) {
        $subscription = \Modules\Subscription\Models\Subscription::where('restaurant_id', $restaurant->id)
            ->where('status', 'active')
            ->with('plan')
            ->latest()
            ->first();

        if ($subscription) {
            if ($subscription->is_trial) {
                $subscriptionStatus = 'trial';
                $trialEndsAt = $subscription->trial_ends_at?->toISOString();
            } else {
                $subscriptionStatus = 'active';
            }
        } elseif ($restaurant->trial_ends_at && $restaurant->trial_ends_at->isFuture()) {
            $subscriptionStatus = 'trial';
            $trialEndsAt = $restaurant->trial_ends_at->toISOString();
        } elseif ($restaurant->trial_ends_at && $restaurant->trial_ends_at->isPast()) {
            $subscriptionStatus = 'expired';
        }
    }

    return response()->json([
        'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'restaurant_id' => $restaurant?->id,
            'restaurant' => $restaurant ? [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'logo' => $restaurant->logo,
                'phone' => $restaurant->phone,
                'email' => $restaurant->email,
                'address' => $restaurant->address,
                'city' => $restaurant->city,
                'state' => $restaurant->state,
                'country' => $restaurant->country,
                'zip_code' => $restaurant->zip_code,
                'full_address' => $restaurant->full_address,
                'currency' => $restaurant->currency,
                'currency_symbol' => $restaurant->currency_symbol,
                'timezone' => $restaurant->timezone,
                'tax_rate' => $restaurant->tax_rate,
                'tax_name' => $restaurant->tax_name,
                'tax_inclusive' => $restaurant->tax_inclusive,
                'receipt_settings' => $restaurant->invoiceSettings(),
                'notification_settings' => $restaurant->notification_settings,
                'status' => $restaurant->status,
                'trial_ends_at' => $restaurant->trial_ends_at?->toISOString(),
            ] : null,
            'branch_id' => $user->branch_id,
            'branch' => $user->branch ? [
                'id' => $user->branch->id,
                'name' => $user->branch->name,
                'is_main' => $user->branch->is_main,
            ] : null,
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                ] : null,
                'status' => $subscriptionStatus,
                'is_trial' => $subscription->is_trial ?? false,
                'ends_at' => $subscription->ends_at?->toISOString(),
                'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
            ] : null,
            'subscription_status' => $subscriptionStatus,
            'trial_ends_at' => $trialEndsAt,
            'allowed_modules' => $user->_allowed_modules ?? [],
        ],
    ]);
});


Route::get('/translations', function (\Illuminate\Http\Request $request) {
    $locale = $request->query('lang', config('app.locale'));

    $supported = ['en', 'bn'];
    if (!in_array($locale, $supported)) {
        $locale = config('app.fallback_locale');
    }

    App::setLocale($locale);

    $translations = trans('message');

    return response()->json([
        'lang' => $locale,
        'messages' => $translations
    ]);
});


Route::middleware('auth:sanctum')->get('/me', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'user' => $request->user(),
        'permissions' => $request->user()->getAllPermissions()->pluck('name')
    ]);
});

Route::middleware('auth:sanctum')->get('/permissions', function (\Illuminate\Http\Request $request) {
    $permissions = \Spatie\Permission\Models\Permission::where('guard_name', 'web')
        ->orderBy('name')
        ->get(['id', 'name']);

    return response()->json([
        'status' => 'success',
        'data' => $permissions,
    ]);
});

