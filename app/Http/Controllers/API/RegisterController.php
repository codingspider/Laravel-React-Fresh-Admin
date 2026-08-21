<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\BaseController as BaseController;
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
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RegisterController extends BaseController
{

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);       
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
            // Restaurant info
            'restaurant_name' => 'required|string|max:255',
            'phone'           => 'nullable|string|max:255',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string|max:500',
            'city'            => 'nullable|string|max:255',
            'state'           => 'nullable|string|max:255',
            'country'         => 'nullable|string|max:255',
            'zip_code'        => 'nullable|string|max:255',
            'currency'        => 'nullable|string|max:10',
            'timezone'        => 'nullable|string|max:255',
            // Owner account
            'first_name' => 'required|string|max:255',
            'last_name'  => 'nullable|string|max:255',
            'username'   => 'required|string|min:4|max:255|unique:users',
            'email_owner' => 'required|email|max:255|unique:users,email',
            'password'   => 'required|string|min:6|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
        }

        try {
            DB::beginTransaction();

            $fullName = trim($request->input('first_name', '') . ' ' . $request->input('last_name', ''));

            // 1. Create owner user
            $user = User::create([
                'name'       => $fullName,
                'username'   => $request->username,
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email_owner,
                'password'   => Hash::make($request->password),
            ]);

            // Assign restaurant owner role
            $role = Role::where('name', 'restaurant_owner')->first()
                ?? Role::where('name', 'super_admin')->first();
            if ($role) {
                $user->assignRole($role);
            }

            // 2. Create restaurant
            $slug = \Illuminate\Support\Str::slug($request->restaurant_name);
            $existingCount = \Modules\Restaurant\Models\Restaurant::where('slug', $slug)->count();
            if ($existingCount > 0) {
                $slug = $slug . '-' . ($existingCount + 1);
            }

            $currencyMap = [
                'USD' => '$', 'EUR' => '€', 'GBP' => '£', 'INR' => '₹',
                'BRL' => 'R$', 'CAD' => 'C$', 'AUD' => 'A$',
            ];
            $currencyCode = $request->currency ?? 'USD';

            $restaurant = \Modules\Restaurant\Models\Restaurant::create([
                'owner_id'        => $user->id,
                'name'            => $request->restaurant_name,
                'slug'            => $slug,
                'phone'           => $request->phone,
                'email'           => $request->email,
                'address'         => $request->address,
                'city'            => $request->city,
                'state'           => $request->state,
                'country'         => $request->country,
                'zip_code'        => $request->zip_code,
                'timezone'        => $request->timezone ?? 'UTC',
                'currency'        => $currencyCode,
                'currency_symbol' => $currencyMap[$currencyCode] ?? '$',
                'status'          => 'active',
                'trial_ends_at'   => now()->addDays(14),
            ]);

            // 3. Link user to restaurant
            $user->update(['restaurant_id' => $restaurant->id]);

            DB::commit();

            return $this->sendResponse([
                'user'       => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
                'restaurant' => ['id' => $restaurant->id, 'name' => $restaurant->name, 'slug' => $restaurant->slug],
            ], 'Account created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Registration Failed: ' . $e->getMessage(), [
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again.',
                'error'   => $e->getMessage(),
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

            $restaurant = $user->restaurant_id
                ? \Modules\Restaurant\Models\Restaurant::find($user->restaurant_id)
                : \Modules\Restaurant\Models\Restaurant::where('owner_id', $user->id)->first();


            return response()->json([
                'name' => $user->name,
                'role' => $user->roles->first()?->name,
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'app_name' => $restaurant?->name ?: env("APP_NAME")
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
