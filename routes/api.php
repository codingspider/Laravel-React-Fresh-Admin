<?php

use App\Http\Controllers\API\Admin\AddonController;
use App\Http\Controllers\API\Admin\BusinessController as AdminBusinessController;
use App\Http\Controllers\API\Admin\CategoryController;
use App\Http\Controllers\API\Admin\LocationController;
use App\Http\Controllers\API\Admin\InventoryItemController;
use App\Http\Controllers\API\Admin\InventoryCategoryController;
use App\Http\Controllers\API\Admin\SupplierController;
use App\Http\Controllers\API\Admin\UnitController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\UserManagementController;
use App\Http\Controllers\API\Admin\VariationController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BranchController;
use App\Http\Controllers\API\BusinessController;
use App\Http\Controllers\API\GeneralController;
use App\Http\Controllers\API\PLanController;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\VatController;
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

Route::middleware(['auth:sanctum', 'check_active_business', 'restaurant.scope', EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('vats', VatController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('addons', AddonController::class);
    Route::apiResource('variations', VariationController::class);
    Route::apiResource('inventory-items', InventoryItemController::class);
    Route::apiResource('inventory-categories', InventoryCategoryController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('user-management', UserManagementController::class);


    Route::get('owner/business', [AdminBusinessController::class, 'index']);
    Route::put('business/setting/update/{id}', [AdminBusinessController::class, 'update']);
    Route::post('notification/update', [AdminBusinessController::class, 'updateNotification']);
    Route::post('update/invoice/setting', [AdminBusinessController::class, 'updateInvoiceSetting']);
    Route::get('get/notification/setting', [AdminBusinessController::class, 'getNotificationSetting']);
    Route::get('get/invoice/setting', [AdminBusinessController::class, 'getInvoiceSetting']);
    Route::get('get/all/addons', [AddonController::class, 'getAllAddons']);
    Route::get('get/all/variations', [VariationController::class, 'getAllVariations']);
    Route::get('get/all/categories', [CategoryController::class, 'getAllCategory']);
});

Route::middleware(['auth:sanctum', 'check_active_business', 'restaurant.scope', 'cookie.filter'])->group(function () {
    Route::get('get/branches', [BranchController::class, 'getBranch']);
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

    if ($user->restaurant_id) {
        $restaurant = \Modules\Restaurant\Models\Restaurant::find($user->restaurant_id);
    } else {
        $restaurant = \Modules\Restaurant\Models\Restaurant::where('owner_id', $user->id)->first();
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
                'currency' => $restaurant->currency,
                'currency_symbol' => $restaurant->currency_symbol,
            ] : null,
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

