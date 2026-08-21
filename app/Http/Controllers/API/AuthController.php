<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    public function logout(Request $request)
    {
        $request->user()?->tokens()->delete();

        if ($request->hasSession()) {
            $request->session()->invalidate();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ])    
        ->withoutCookie('access_token', '/', null, false, true, false, 'lax')
        ->withoutCookie('laravel-session', '/', null, false, true, false, 'lax')
        ->withoutCookie('XSRF-TOKEN', '/', null, false, false, false, 'lax');
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();

        User::where('id', $user->id)->update($request->only('name', 'email'));

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $request->input('name'),
                'email' => $request->input('email'),
            ],
        ]);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'The current password is incorrect.',
            ], 422);
        }

        User::where('id', $user->id)->update([
            'password' => Hash::make($request->input('password')),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully.',
        ]);
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
