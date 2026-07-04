<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Hash;
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions (if they don't exist)
        $permissions = [
            // User Management
            'view_user',
            'create_user',
            'update_user',
            'delete_user',

            // Role & Permission Management
            'role_list',
            'role_create',
            'role_edit',
            'role_delete',
            'assign_roles',
            'view_permissions',

            // Reports
            'view_report',

            // Settings
            'view_dashboard_data',
            'access_business_settings',
            'access_invoice_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Pluck all permissions
        $allPermissions = Permission::where('guard_name', 'web')->pluck('id');

        // Create Admin Role and assign ALL permissions
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        // Sync all permissions to admin role
        $adminRole->syncPermissions($allPermissions);

        // Create Super Admin Role (same as admin but for future extensibility)
        $superAdminRole = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web',
        ]);
        $superAdminRole->syncPermissions($allPermissions);

        // Create Manager Role with limited permissions
        $managerRole = Role::firstOrCreate([
            'name' => 'manager',
            'guard_name' => 'web',
        ]);
        $managerPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view users',
                'view roles',
                'view products',
                'view categories',
                'view sales',
                'create sales',
                'view pos',
                'process sale',
                'view purchases',
                'view customers',
                'view suppliers',
                'view reports',
                'view sales reports',
                'view stock reports',
                'view dashboard',
            ])
            ->pluck('id');
        $managerRole->syncPermissions($managerPermissions);

        // Create Cashier Role with minimal permissions
        $cashierRole = Role::firstOrCreate([
            'name' => 'cashier',
            'guard_name' => 'web',
        ]);
        $cashierPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view pos',
                'process sale',
                'view products',
                'view customers',
            ])
            ->pluck('id');
        $cashierRole->syncPermissions($cashierPermissions);

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to the user
        $admin->assignRole('admin');

        // Create Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Create Manager User
        $manager = User::firstOrCreate(
            ['email' => 'manager@gmail.com'],
            [
                'name' => 'Manager User',
                'email' => 'manager@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );
        $manager->assignRole('manager');

        // Create Cashier User
        $cashier = User::firstOrCreate(
            ['email' => 'cashier@gmail.com'],
            [
                'name' => 'Cashier User',
                'email' => 'cashier@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );
        $cashier->assignRole('cashier');

        $this->command->info('Users, roles, and permissions seeded successfully!');
        $this->command->info('Admin: admin@gmail.com / password');
        $this->command->info('Super Admin: superadmin@gmail.com / password');
        $this->command->info('Manager: manager@gmail.com / password');
        $this->command->info('Cashier: cashier@gmail.com / password');
    }
}