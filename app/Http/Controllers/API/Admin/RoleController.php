<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends BaseController
{
        /**
     * List all products (or ingredients if product_type = raw/packaging)
     */
    public function index(Request $request)
    {
        try {
            $roles = Role::select('id','name')
            ->where('business_id', user_business_id())
            ->orderBy('id', 'desc')
            ->paginate(dataShowingNumber());
            return $this->sendResponse($roles, 'Roles retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: '.$e->getMessage());
        }
    }
    
    public function getAllRole(Request $request)
    {
        try {
            $roles = Role::where('business_id', user_business_id())->get();
            return $this->sendResponse($roles, 'Role retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: '.$e->getMessage());
        }
    }

    /**
     * Show single product (ingredient)
     */
    public function show(Role $role)
    {
        $data = [
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name')
        ];
        return $this->sendResponse($data, 'Role retrieved successfully.');
    }

    /**
     * Edit product (same as show)
     */
    public function edit($id)
    {
        $role = Role::find($id);
        return $this->sendResponse($role, 'Role retrieved successfully.');
    }

    /**
     * Store new product (ingredient)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            $role = new role();
            $role->name = $request->name;
            $role->business_id = user_business_id();
            $role->guard_name = 'web';
            $role->is_default = 0;
            $role->is_service_staff = 0;
            $role->save();

            // Create permissions if not exist & assign
            $permissions = [];

            foreach ($request->permissions as $perm) {
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
     * Update product
     */
    public function update(Request $request, Role $role)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255'
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
            $role->syncPermissions($request->permissions);

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
     * Delete product
     */
    public function destroy($id)
    {
        try {
            $role = Role::find($id);
            $role->syncPermissions([]);
            activityLog('role','deleted','User '.user_full_name().' deleted role '.$role->name);
            $role->delete();
            return $this->sendResponse([], 'Role deleted successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }
}
