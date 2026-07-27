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

            // Dashboard
            'view_dashboard_data',

            // Settings
            'access_business_settings',
            'access_invoice_settings',

            // Restaurant
            'view_restaurants',
            'create_restaurants',
            'update_restaurants',
            'delete_restaurants',

            // Branch
            'view_branches',
            'create_branches',
            'update_branches',
            'delete_branches',

            // Menu — Categories
            'view_menu_categories',
            'create_menu_categories',
            'update_menu_categories',
            'delete_menu_categories',

            // Menu — Items
            'view_menu_items',
            'create_menu_items',
            'update_menu_items',
            'delete_menu_items',

            // Menu — Modifier Groups
            'view_modifier_groups',
            'create_modifier_groups',
            'update_modifier_groups',
            'delete_modifier_groups',

            // Table Management — Floors
            'view_floors',
            'create_floors',
            'update_floors',
            'delete_floors',

            // Table Management — Tables
            'view_tables',
            'create_tables',
            'update_tables',
            'delete_tables',

            // Table Management — Reservations
            'view_reservations',
            'create_reservations',
            'update_reservations',
            'delete_reservations',

            // Orders
            'view_orders',
            'create_orders',
            'update_orders',
            'delete_orders',

            // POS
            'view_pos',
            'process_sale',

            // Products (legacy admin)
            'view_products',
            'create_products',
            'update_products',
            'delete_products',

            // Categories (legacy admin)
            'view_categories',
            'create_categories',
            'update_categories',
            'delete_categories',

            // Units (legacy admin)
            'view_units',
            'create_units',
            'update_units',
            'delete_units',

            // Inventory
            'view_inventory',
            'create_inventory',
            'update_inventory',
            'delete_inventory',

            // Purchasing
            'view_purchases',
            'create_purchases',
            'update_purchases',
            'delete_purchases',

            // Customers
            'view_customers',
            'create_customers',
            'update_customers',
            'delete_customers',

            // Suppliers
            'view_suppliers',
            'create_suppliers',
            'update_suppliers',
            'delete_suppliers',

            // Reports
            'view_reports',

            // Kitchen
            'view_kitchen_display',
            'manage_kitchen_orders',

            // Delivery
            'view_deliveries',
            'manage_deliveries',
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
                'view_dashboard_data',
                'view_user',
                'view_restaurants',
                'view_branches',
                'create_branches',
                'update_branches',
                'view_menu_categories',
                'create_menu_categories',
                'update_menu_categories',
                'view_menu_items',
                'create_menu_items',
                'update_menu_items',
                'view_modifier_groups',
                'view_floors',
                'create_floors',
                'update_floors',
                'view_tables',
                'create_tables',
                'update_tables',
                'view_reservations',
                'create_reservations',
                'update_reservations',
                'view_orders',
                'create_orders',
                'update_orders',
                'view_pos',
                'process_sale',
                'view_products',
                'create_products',
                'update_products',
                'view_categories',
                'create_categories',
                'update_categories',
                'view_inventory',
                'view_purchases',
                'view_customers',
                'create_customers',
                'view_suppliers',
                'view_reports',
                'access_business_settings',
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
                'view_dashboard_data',
                'view_pos',
                'process_sale',
                'view_menu_items',
                'view_menu_categories',
                'view_tables',
                'view_orders',
                'create_orders',
                'view_customers',
                'create_customers',
            ])
            ->pluck('id');
        $cashierRole->syncPermissions($cashierPermissions);

        // Create Restaurant Owner Role (full access to own restaurant)
        $ownerRole = Role::firstOrCreate([
            'name' => 'restaurant_owner',
            'guard_name' => 'web',
        ]);
        $ownerRole->syncPermissions($allPermissions);

        // Create Branch Manager Role
        $branchManagerRole = Role::firstOrCreate([
            'name' => 'branch_manager',
            'guard_name' => 'web',
        ]);
        $branchManagerPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_branches',
                'view_menu_categories',
                'view_menu_items',
                'create_menu_items',
                'update_menu_items',
                'view_modifier_groups',
                'view_floors',
                'create_floors',
                'update_floors',
                'view_tables',
                'create_tables',
                'update_tables',
                'view_reservations',
                'create_reservations',
                'update_reservations',
                'view_orders',
                'create_orders',
                'update_orders',
                'view_pos',
                'process_sale',
                'view_inventory',
                'view_customers',
                'create_customers',
                'view_reports',
            ])
            ->pluck('id');
        $branchManagerRole->syncPermissions($branchManagerPermissions);

        // Create Waiter Role
        $waiterRole = Role::firstOrCreate([
            'name' => 'waiter',
            'guard_name' => 'web',
        ]);
        $waiterPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_menu_items',
                'view_tables',
                'view_reservations',
                'view_orders',
                'create_orders',
                'view_customers',
            ])
            ->pluck('id');
        $waiterRole->syncPermissions($waiterPermissions);

        // Create Kitchen Staff Role
        $kitchenRole = Role::firstOrCreate([
            'name' => 'kitchen_staff',
            'guard_name' => 'web',
        ]);
        $kitchenPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_menu_items',
                'view_orders',
                'view_kitchen_display',
                'manage_kitchen_orders',
            ])
            ->pluck('id');
        $kitchenRole->syncPermissions($kitchenPermissions);

        // Create Chef Role
        $chefRole = Role::firstOrCreate([
            'name' => 'chef',
            'guard_name' => 'web',
        ]);
        $chefPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_menu_items',
                'create_menu_items',
                'update_menu_items',
                'view_menu_categories',
                'create_menu_categories',
                'update_menu_categories',
                'view_modifier_groups',
                'create_modifier_groups',
                'update_modifier_groups',
                'view_orders',
                'view_kitchen_display',
                'manage_kitchen_orders',
                'view_inventory',
            ])
            ->pluck('id');
        $chefRole->syncPermissions($chefPermissions);

        // Create Delivery Boy Role
        $deliveryRole = Role::firstOrCreate([
            'name' => 'delivery_boy',
            'guard_name' => 'web',
        ]);
        $deliveryPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_orders',
                'view_deliveries',
                'manage_deliveries',
            ])
            ->pluck('id');
        $deliveryRole->syncPermissions($deliveryPermissions);

        // Create Accountant Role
        $accountantRole = Role::firstOrCreate([
            'name' => 'accountant',
            'guard_name' => 'web',
        ]);
        $accountantPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_reports',
                'view_purchases',
                'create_purchases',
                'update_purchases',
                'view_inventory',
                'view_customers',
                'view_suppliers',
            ])
            ->pluck('id');
        $accountantRole->syncPermissions($accountantPermissions);

        // Create HR Manager Role
        $hrManagerRole = Role::firstOrCreate([
            'name' => 'hr_manager',
            'guard_name' => 'web',
        ]);
        $hrManagerPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_user',
                'create_user',
                'update_user',
                'view_reports',
            ])
            ->pluck('id');
        $hrManagerRole->syncPermissions($hrManagerPermissions);

        // Create Inventory Manager Role
        $inventoryManagerRole = Role::firstOrCreate([
            'name' => 'inventory_manager',
            'guard_name' => 'web',
        ]);
        $inventoryManagerPermissions = Permission::where('guard_name', 'web')
            ->whereIn('name', [
                'view_dashboard_data',
                'view_inventory',
                'create_inventory',
                'update_inventory',
                'delete_inventory',
                'view_purchases',
                'create_purchases',
                'update_purchases',
                'view_suppliers',
                'create_suppliers',
                'update_suppliers',
                'view_reports',
            ])
            ->pluck('id');
        $inventoryManagerRole->syncPermissions($inventoryManagerPermissions);

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