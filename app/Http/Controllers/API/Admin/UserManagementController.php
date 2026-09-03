<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\BaseController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class UserManagementController extends BaseController
{
    public function index(Request $request)
    {
        try {
            $query = User::with('roles')->orderBy('id', 'desc');

            if ($request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
                });
            }

            $restaurantId = getRestaurantId();
            if ($restaurantId) {
                $query->where('restaurant_id', $restaurantId);
            }

            $data = $query->paginate($request->input('per_page', 15));

            return $this->sendResponse($data, 'Users retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Users fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve users.', [], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::with(['roles', 'permissions'])->findOrFail($id);
            return $this->sendResponse($user, 'User retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('User not found.', [], 404);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|exists:roles,id',
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name'          => $validated['name'],
                'email'         => $validated['email'],
                'password'      => Hash::make($validated['password']),
                'restaurant_id' => $validated['restaurant_id'] ?? getRestaurantId(),
                'branch_id'     => $validated['branch_id'] ?? null,
            ]);

            $role = Role::findById($validated['role'], 'web');
            $user->assignRole($role);

            DB::commit();

            return $this->sendResponse($user->load('roles'), 'User created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('User creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to create user.', [], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('User not found.', [], 404);
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|min:6',
            'role'     => 'required|exists:roles,id',
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        DB::beginTransaction();

        try {
            $updateData = [
                'name'          => $validated['name'],
                'email'         => $validated['email'],
                'restaurant_id' => $validated['restaurant_id'] ?? $user->restaurant_id,
                'branch_id'     => $validated['branch_id'] ?? $user->branch_id,
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            $role = Role::findById($validated['role'], 'web');
            $user->syncRoles([$role]);

            DB::commit();

            return $this->sendResponse($user->load(['roles', 'permissions']), 'User updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('User update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update user.', [], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->sendError('User not found.', [], 404);
            }
            $user->syncRoles([]);
            $user->delete();
            return $this->sendResponse([], 'User deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('User deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete user.', [], 500);
        }
    }
}
