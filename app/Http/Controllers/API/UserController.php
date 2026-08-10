<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
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
            return $this->sendResponse($data, 'User retrived successfully.');

        } catch (\Exception $e) {
            return $this->sendError('Server Error.'.$e->getMessage());
        }
    }
    
    public function edit($id)
    {
        try {
            $owner = User::find($id);
            return $this->sendResponse($owner, 'User retrived successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error.'.$e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required',
            'email'     => 'required|email|unique:users,email',
            'role'      => 'required',
            'password'  => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', 422, $validator->errors());
        }

        DB::beginTransaction();

        try {
            // Check if user already exists
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                return $this->sendError('User with this email already exists.');
            }

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role
            ];

            // store new user
            $user = User::create($userData);
            DB::commit();

            return $this->sendResponse(['user' => $user], 'User saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }
    
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required',
            'email'     => 'required|email|unique:users,email',
            'role'      => 'required',
            'password'  => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', 422, $validator->errors());
        }

        DB::beginTransaction();

        try {
            $user = User::find($request->id);
            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = $request->role;
            $user->save();
            DB::commit();
            return $this->sendResponse(['user' => $user], 'User saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }

    public function delete($id)
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
}
