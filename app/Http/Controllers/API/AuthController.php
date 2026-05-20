<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    public function logout(Request $request)
    {
        $request->user()?->tokens()->delete();
        $request->session()->invalidate();

        return response()->json([
            'message' => 'Logged out successfully'
        ])    
        ->withoutCookie('access_token', '/', null, false, true, false, 'lax')
        ->withoutCookie('laravel-session', '/', null, false, true, false, 'lax')
        ->withoutCookie('XSRF-TOKEN', '/', null, false, false, false, 'lax');
    }

    public function giveAllPermissionsToAdmin()
    {
        $guard = 'web';

        // Get or create admin role WITH correct guard
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => $guard,
            'business_id' => user_business_id(),
        ]);

        // Get all permissions for same guard
        $permissions = Permission::where('guard_name', $guard)->get();

        // Sync permissions to admin role
        $adminRole->syncPermissions($permissions);

        // Assign role to superadmin user safely
        $user = User::where('username', 'superadmin')->first();

        if ($user) {
            $user->syncRoles([$adminRole]);
        }

        return response()->json([
            'message' => 'All permissions assigned to admin role successfully',
            'role' => $adminRole->name,
            'permissions_count' => $permissions,
        ]);
    }
}
