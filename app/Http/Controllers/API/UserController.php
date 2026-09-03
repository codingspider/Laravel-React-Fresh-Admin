<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\API\BaseController;

class UserController extends BaseController
{
    public function index(Request $request)
    {
        try {
            $search = $request->input('search');
            $query = User::with(['branch:id,name']);

            $restaurantId = getRestaurantId($request->user());
            if ($restaurantId) {
                $query->where('restaurant_id', $restaurantId);
            }

            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            if ($search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            }

            $data = $query->paginate(10);
            return $this->sendResponse($data, 'Users retrieved successfully.');

        } catch (\Exception $e) {
            \Log::error('Users fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve users.', [], 500);
        }
    }
    
    public function edit($id)
    {
        try {
            $owner = User::findOrFail($id);
            return $this->sendResponse($owner, 'User retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('User fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve user.', [], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required',
            'email'     => 'required|email|unique:users,email',
            'role'      => 'required',
            'password'  => 'required',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
            DB::commit();

            return $this->sendResponse(['user' => $user], 'User saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('User creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to create user.', [], 500);
        }
    }
    
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required',
            'email'     => 'required|email|unique:users,email,' . $request->id,
            'password'  => 'nullable',
        ]);

        DB::beginTransaction();

        try {
            $user = User::findOrFail($request->id);
            $user->name = $validated['name'];
            $user->email = $validated['email'];
            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
            $user->save();
            DB::commit();
            return $this->sendResponse(['user' => $user], 'User updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('User update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update user.', [], 500);
        }
    }

    public function delete($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return $this->sendResponse([], 'User deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('User deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete user.', [], 500);
        }
    }
}
