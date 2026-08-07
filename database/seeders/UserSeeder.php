<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Modules\Restaurant\Models\Restaurant;
use Modules\Branch\Models\Branch;
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
            'view_sale_report',
            'view_purchase_report',
            'view_tax_report',
            'view_expense_report',

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

            // HRM - Payroll
            'view_payrolls',
            'create_payrolls',
            'update_payrolls',
            'delete_payrolls',

            // Accounting - Chart of Accounts
            'view_accounts',
            'create_accounts',
            'update_accounts',
            'delete_accounts',

            // Accounting - Income
            'view_income',
            'create_income',
            'update_income',
            'delete_income',

            // Accounting - Expense
            'view_expense_categories',
            'create_expense_categories',
            'update_expense_categories',
            'delete_expense_categories',
            'view_expenses',
            'create_expenses',
            'update_expenses',
            'delete_expenses',

            // Accounting - Cash & Bank
            'view_cash_bank',
            'create_cash_bank',
            'update_cash_bank',
            'delete_cash_bank',

            // Accounting - Journal Entries
            'view_journal_entries',
            'create_journal_entries',
            'update_journal_entries',
            'delete_journal_entries',

            // Accounting - Ledger
            'view_ledger',

            // Accounting - Trial Balance
            'view_trial_balance',

            // Accounting - Financial Reports
            'view_profit_loss_report',
            'view_balance_sheet',
            'view_cash_flow',
            'view_accounting_dashboard',

            // Loyalty
            'view_loyalty_settings',
            'update_loyalty_settings',
            'view_loyalty_customers',
            'view_loyalty_transactions',
            'manage_loyalty_points',

            // Notifications
            'view_notifications',
            'delete_notifications',
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

        // Create Restaurant Owner User (linked to restaurant)
        $restaurantOwner = User::firstOrCreate(
            ['email' => 'owner@gmail.com'],
            [
                'name' => 'Restaurant Owner',
                'email' => 'owner@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );
        $restaurantOwner->assignRole('restaurant_owner');

        // Create Restaurant
        $restaurant = Restaurant::firstOrCreate(
            ['slug' => 'default-restaurant'],
            [
                'owner_id' => $restaurantOwner->id,
                'name' => 'Default Restaurant',
                'slug' => 'default-restaurant',
                'email' => 'restaurant@example.com',
                'phone' => '+1234567890',
                'address' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'country' => 'US',
                'zip_code' => '10001',
                'timezone' => 'America/New_York',
                'currency' => 'USD',
                'currency_symbol' => '$',
                'tax_rate' => 0,
                'tax_name' => 'Tax',
                'tax_inclusive' => false,
                'status' => 'active',
            ]
        );

        // Update user with restaurant_id
        if (!$restaurantOwner->restaurant_id) {
            $restaurantOwner->update(['restaurant_id' => $restaurant->id]);
        }

        // Create Main Branch
        Branch::firstOrCreate(
            ['slug' => 'main-branch'],
            [
                'restaurant_id' => $restaurant->id,
                'name' => 'Main Branch',
                'slug' => 'main-branch',
                'is_main' => true,
                'status' => 'active',
            ]
        );

        $this->command->info('Roles and permissions seeded successfully!');
        $this->command->info('Super Admin: superadmin@gmail.com / password');
        $this->command->info('Restaurant Owner: owner@gmail.com / password');
    }
}
