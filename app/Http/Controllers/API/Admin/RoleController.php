<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends BaseController
{
    /**
     * List roles scoped to the authenticated user's restaurant.
     * Super admins see the system roles (restaurant_id = null).
     */
    public function index(Request $request)
    {
        try {
            $roles = $this->scopedRoleQuery()
                ->select('id', 'name', 'restaurant_id')
                ->when($request->search, function ($q, $search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orderBy('id', 'desc')
                ->paginate(dataShowingNumber());

            return $this->sendResponse($roles, 'Roles retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: '.$e->getMessage());
        }
    }

    /**
     * Return all roles for the current restaurant (used when assigning roles to users).
     */
    public function getAllRole(Request $request)
    {
        try {
            $roles = $this->scopedRoleQuery()
                ->orderBy('name')
                ->get();

            return $this->sendResponse($roles, 'Role retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: '.$e->getMessage());
        }
    }

    /**
     * Show a single role (with its permissions) scoped to the current restaurant.
     */
    public function show($id)
    {
        $role = $this->scopedRoleQuery()->find($id);

        if (!$role) {
            return $this->sendError('Role not found.', 404);
        }

        $data = [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name')
        ];

        return $this->sendResponse($data, 'Role retrieved successfully.');
    }

    /**
     * Edit a role (same as show) scoped to the current restaurant.
     */
    public function edit($id)
    {
        $role = $this->scopedRoleQuery()->find($id);

        if (!$role) {
            return $this->sendError('Role not found.', 404);
        }

        return $this->sendResponse($role, 'Role retrieved successfully.');
    }

    /**
     * Store a new role scoped to the authenticated user's restaurant.
     */
    public function store(Request $request)
    {
        $restaurantId = getRestaurantId();

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(config('permission.table_names.roles'), 'name')
                    ->where('guard_name', 'web')
                    ->where('restaurant_id', $restaurantId),
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            $role = new Role();
            $role->name = $request->name;
            $role->guard_name = 'web';
            $role->restaurant_id = $restaurantId;
            $role->save();

            // Create permissions if not exist & assign
            $permissions = [];

            foreach ($request->permissions ?? [] as $perm) {
                $permissions[] = Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }

            // Assign permissions to role
            $role->syncPermissions($permissions);

            activityLog('role', 'create', 'User '.user_full_name().' created role '.$role->name);

            DB::commit();
            return $this->sendResponse($role, 'Role saved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Server Error: '.$e->getMessage(), 500);
        }
    }

    /**
     * Update a role scoped to the current restaurant.
     */
    public function update(Request $request, $id)
    {
        $role = $this->scopedRoleQuery()->find($id);

        if (!$role) {
            return $this->sendError('Role not found.', 404);
        }

        $restaurantId = getRestaurantId();

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(config('permission.table_names.roles'), 'name')
                    ->where('guard_name', 'web')
                    ->where('restaurant_id', $restaurantId)
                    ->ignore($role->id),
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        DB::beginTransaction();

        try {
            // Update role name
            $role->name = $request->name;
            $role->save();

            // Sync permissions (IMPORTANT)
            $role->syncPermissions($request->permissions ?? []);

            activityLog(
                'role',
                'update',
                'User ' . user_full_name() . ' updated role ' . $role->name
            );

            DB::commit();

            return $this->sendResponse(
                $role,
                'Role updated successfully.'
            );
        } catch (\Exception $e) {
            DB::rollBack();

            return $this->sendError(
                'Server Error: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Delete a role scoped to the current restaurant.
     */
    public function destroy($id)
    {
        $role = $this->scopedRoleQuery()->find($id);

        if (!$role) {
            return $this->sendError('Role not found.', 404);
        }

        try {
            $role->syncPermissions([]);
            activityLog('role','deleted','User '.user_full_name().' deleted role '.$role->name);
            $role->delete();
            return $this->sendResponse([], 'Role deleted successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Base query scoped to the current user's restaurant.
     * Super admins operate on system roles (restaurant_id = null).
     */
    private function scopedRoleQuery()
    {
        $restaurantId = getRestaurantId();

        return Role::query()->where(function ($q) use ($restaurantId) {
            if ($restaurantId === null) {
                $q->whereNull('restaurant_id');
            } else {
                $q->where('restaurant_id', $restaurantId);
            }
        });
    }
}
