<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\BaseController as BaseController;
use App\Http\Controllers\Controller;
use App\Mail\ForgotPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Traits\BusinessTrait;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RegisterController extends BaseController
{
    use BusinessTrait;

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }
   
        $input = $request->all();
        $input['password'] = Hash::make($input['password']);
        $user = User::create($input);

        $role = Role::where('name', 'superadmin')->first();
        if ($role) {
            $user->assignRole($role);
        }

        $permissions = Permission::all();
        $user->syncPermissions($permissions);

        $success['token'] =  $user->createToken('MyApp')->plainTextToken;
        $success['name'] =  $user->name;
   
        return $this->sendResponse($success, 'User register successfully.');
    }
    
    
    public function storeBusinessInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
            'currency' => 'required|numeric',
            'country' => 'required|max:255',
            'state' => 'required|max:255',
            'city' => 'required|max:255',
            'zip_code' => 'required|max:255',
            'address' => 'required|max:255',
            'time_zone' => 'nullable|max:255',
            'email' => 'sometimes|nullable|email|unique:users|max:255',
            'first_name' => 'required|max:255',
            'username' => 'required|min:4|max:255|unique:users',
            'password' => 'required|min:4|max:255',
            'fy_start_month' => 'required',
            'accounting_method' => 'required',
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        try {
            DB::beginTransaction();

            // Owner details
            $owner_details = $request->only([
                'first_name',
                'last_name',
                'username',
                'email',
                'password',
                'language'
            ]);

            $owner_details['language'] = empty($owner_details['language'])
                ? config('app.locale')
                : $owner_details['language'];

            $owner_details['role'] = 'superadmin';

            $user = User::create($owner_details);

            $role = Role::where('name', 'superadmin')->first();
            if ($role) {
                $user->assignRole($role);
            }

            $permissions = Permission::all();
            $user->syncPermissions($permissions);

            // Business details
            $business_details = $request->only([
                'name',
                'start_date',
                'time_zone',
                'fy_start_month',
                'accounting_method'
            ]);

            $business_details['currency_id'] = $request->currency;
            $business_details['owner_id'] = $user->id;
            $business_details['stop_selling_before'] = 0;
            $business_details['weighing_scale_setting'] = '';

            $business = $this->createNewBusiness($business_details);

            // Update user with business ID
            $user->business_id = $business->id;
            $user->save();

            // Location
            $business_location = $request->only([
                'name',
                'country',
                'state',
                'city',
                'zip_code',
            ]);

            $business_location['landmark'] = $request->address;

            $new_location = $this->addLocation($business->id, $business_location);

            DB::commit();

            return $this->sendResponse($business, 'Business registered successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            // Log error (VERY IMPORTANT)
            \Log::error('Business Registration Failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
   
    /**
     * Login api
     *
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login_type = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [
            $login_type => $request->login,
            'password' => $request->password,
        ];

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // if ($user->allow_login != 1) {
            //     Auth::logout();
            //     return response()->json(['message' => 'Account is disabled.'], 403);
            // }

            // Regenerate session for security
            $token = $user->createToken('react_token')->plainTextToken;

            $cookie = cookie(
                'access_token',
                $token,
                60,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );

            return response()->json([
                'name' => $user->first_name . ' ' . $user->last_name,
                'role' => $user->role,
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'app_name' => env("APP_NAME")
            ])->cookie($cookie);
        }

        return response()->json(['message' => 'These credentials do not match our records.'], 401);
    }
    
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error.'. $validator->errors());
            }

            $user = User::where('email', $request->email)->first();

            // Generate token
            $token = Str::random(60);

            // Store token in password_resets table
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'email' => $user->email,
                    'token' => bcrypt($token),
                    'created_at' => now()
                ]
            );

            // Send email with the token
            Mail::to($user->email)->queue(new ForgotPasswordMail($token));

            return $this->sendResponse(['email' => $user->email], 'Reset password email sent successfully.');

        } catch (\Exception $e) {
            return $this->sendError('Server Error.'.$e->getMessage());
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
                'token' => 'required',
                'password' => 'required|min:6',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error.'. $validator->errors(), 422);
            }

            // Attempt to reset the user's password
            $status = Password::reset(
                $request->only('email', 'password', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                        'remember_token' => Str::random(60),
                    ])->save();
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return $this->sendResponse([], 'Password has been reset successfully.');
            } else {
                return $this->sendError('Reset failed.', ['error' => __($status)], 400);
            }

        } catch (\Exception $e) {
            return $this->sendError('Something went wrong.', ['error' => $e->getMessage()], 500);
        }
    }
}
