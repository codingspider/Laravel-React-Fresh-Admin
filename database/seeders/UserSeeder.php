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
            'manage_pos_settings',

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

            // Recipes
            'view_recipes',
            'create_recipes',
            'update_recipes',
            'delete_recipes',
            'manage_recipe_ingredients',

            // Stock movements (transfers, adjustments, waste, valuation)
            'view_stock_movements',
            'create_stock_movements',
            'manage_stock_transfers',
            'manage_stock_adjustments',
            'manage_stock_waste',
            'view_stock_valuation',

            // Supplier CRM
            'manage_supplier_contacts',
            'manage_supplier_documents',
            'manage_supplier_transactions',
            'manage_supplier_ratings',

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
            'accept_kitchen_orders',
            'assign_chef',

            // Customer Display
            'view_customer_display',
            'manage_customer_display',

            // Delivery
            'view_deliveries',
            'manage_deliveries',

            // Currencies
            'view_currencies',
            'create_currencies',
            'update_currencies',
            'delete_currencies',

            // Packages
            'view_packages',
            'create_packages',
            'update_packages',
            'delete_packages',

            // Plans
            'view_plans',
            'create_plans',
            'update_plans',
            'delete_plans',

            // Subscriptions
            'view_subscriptions',
            'create_subscriptions',
            'update_subscriptions',
            'delete_subscriptions',

            // HRM - Employees
            'view_employees',
            'create_employees',
            'update_employees',
            'delete_employees',

            // HRM - Departments
            'view_departments',
            'create_departments',
            'update_departments',
            'delete_departments',

            // HRM - Designations
            'view_designations',
            'create_designations',
            'update_designations',
            'delete_designations',

            // HRM - Attendance
            'view_attendance',
            'create_attendance',
            'update_attendance',
            'delete_attendance',

            // HRM - Leave
            'view_leave_requests',
            'create_leave_requests',
            'update_leave_requests',
            'delete_leave_requests',
            'approve_leave_requests',

            // HRM - Holidays
            'view_holidays',
            'create_holidays',
            'update_holidays',
            'delete_holidays',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Pluck all permissions
        $allPermissions = Permission::where('guard_name', 'web')->pluck('id');

        // Super Admin Role — full access to the entire application
        $superAdminRole = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web',
        ]);
        $superAdminRole->syncPermissions($allPermissions);

        // Restaurant Owner Role — full access to own restaurant data.
        // All other roles (manager, cashier, waiter, kitchen_staff, etc.)
        // are created by the restaurant owner from within the application.
        $ownerRole = Role::firstOrCreate([
            'name' => 'restaurant_owner',
            'guard_name' => 'web',
        ]);
        $ownerRole->syncPermissions($allPermissions);

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

        // Create Restaurant Owner User (linked to restaurant_id=1)
        $restaurantOwner = User::firstOrCreate(
            ['email' => 'owner@gmail.com'],
            [
                'name' => 'Restaurant Owner',
                'email' => 'owner@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
                'restaurant_id' => 1,
            ]
        );
        $restaurantOwner->assignRole('restaurant_owner');

        $this->command->info('Roles and permissions seeded successfully!');
        $this->command->info('Super Admin: superadmin@gmail.com / password');
        $this->command->info('Restaurant Owner: owner@gmail.com / password');
    }
}
