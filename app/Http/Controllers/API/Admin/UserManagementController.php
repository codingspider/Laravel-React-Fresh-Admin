<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\BaseController;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserManagementController extends BaseController
{
    public function index(Request $request)
    {
        try {
            $data = User::select('id','surname','first_name','last_name', 'username', 'email', 'status')
            ->where('business_id', user_business_id())
            ->orderBy('id', 'desc')
            ->paginate(dataShowingNumber())
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->surname. ' ' .$user->first_name.' '.$user->last_name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role'  => $user->getRoleNames()->first()
                ];
            });

            return $this->sendResponse($data, 'User retrived successfully.');

        } catch (\Exception $e) {
            return $this->sendError('Server Error.'.$e->getMessage());
        }
    }
    
    public function show($id)
    {
        try {
            $user = User::with(['roles', 'permissions'])->find($id);

            return $this->sendResponse($user, 'User retrived successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error.'.$e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'surname'           => 'required|string',
            'first_name'        => 'required|string',
            'last_name'         => 'required|string',
            'status'            => 'required',
            'allow_login'            => 'required',
            'username'          => 'required|unique:users,username',
            'email'             => 'required|email|unique:users,email',
            'role'           => 'required|exists:roles,id',
            'password'          => 'required|min:6',
            'location_permissions' => 'array',
        ]);

        if ($validator->fails()) {
            return $this->sendError(
                'Validation Error.',
                $validator->errors()->toArray(),
                422
            );
        }

        DB::beginTransaction();

        try {
            // Create user
            $user = User::create([
                'surname'     => $request->surname,
                'first_name'  => $request->first_name,
                'last_name'   => $request->last_name,
                'username'    => $request->username,
                'email'       => $request->email,
                'status'      => $request->status,
                'allow_login'      => $request->allow_login,
                'business_id'      => user_business_id(),
                'password'    => Hash::make($request->password),
            ]);

            // Assign role (Spatie)
            $role = Role::findById($request->role, 'web');
            $user->assignRole($role);

            // Assign location permissions
            $this->assignLocationPermissions($user, $request);

            DB::commit();

            return $this->sendResponse($user, 'User created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }
    
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('User not found.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'surname'              => 'required|string',
            'first_name'           => 'required|string',
            'last_name'            => 'required|string',
            'status'               => 'required',
            'allow_login'          => 'required',
            'username'             => 'required|unique:users,username,' . $id,
            'email'                => 'required|email|unique:users,email,' . $id,
            'role'                 => 'required|exists:roles,id',
            'password'             => 'nullable|min:6',
            'locations'            => 'array',
        ]);

        if ($validator->fails()) {
            return $this->sendError(
                'Validation Error.',
                $validator->errors()->toArray(),
                422
            );
        }

        DB::beginTransaction();

        try {

            // Update user
            $user->update([
                'surname'      => $request->surname,
                'first_name'   => $request->first_name,
                'last_name'    => $request->last_name,
                'username'     => $request->username,
                'email'        => $request->email,
                'status'       => $request->status,
                'allow_login'  => $request->allow_login,
            ]);

            // Update password only if provided
            if ($request->filled('password')) {
                $user->update([
                    'password' => Hash::make($request->password),
                ]);
            }

            // Sync role
            $role = Role::findById($request->role, 'web');

            $user->syncRoles([$role]);

            // Sync location permissions
            $this->assignLocationPermissions($user, $request);

            DB::commit();

            return $this->sendResponse(
                $user->load(['roles', 'permissions']),
                'User updated successfully.'
            );

        } catch (\Exception $e) {

            DB::rollBack();

            return $this->sendError(
                'Server Error: ' . $e->getMessage(),
                500
            );
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->sendError('User not found.', 404);
            }
            $user->delete();
            return $this->sendResponse([], 'User deleted successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }

    public function assignLocationPermissions($user, $request)
    {
        $permissions = [];

        $location_ids = $request->input('locations', []);

        foreach ($location_ids as $id) {
            Permission::firstOrCreate([
                'name' => 'location.' . $id,
                'guard_name' => 'web'
            ]);

            $permissions[] = 'location.' . $id;
        }

        $user->syncPermissions($permissions);
    }
}
