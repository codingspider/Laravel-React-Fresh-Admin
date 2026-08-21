const permissions = {
    '/branch/list': 'view_branches',
    '/branch/create': 'create_branches',
    '/branch/edit': 'update_branches',
    '/branch/view': 'view_branches',

    '/restaurant/list': 'view_restaurants',
    '/restaurant/create': 'create_restaurants',
    '/restaurant/edit': 'update_restaurants',
    '/restaurant/view': 'view_restaurants',

    '/menu/categories': 'view_menu_categories',
    '/menu/category/create': 'create_menu_categories',
    '/menu/category/edit': 'update_menu_categories',
    '/menu/items': 'view_menu_items',
    '/menu/item/create': 'create_menu_items',
    '/menu/item/edit': 'update_menu_items',
    '/menu/item/view': 'view_menu_items',
    '/menu/modifier-groups': 'view_modifier_groups',
    '/menu/modifier-group/create': 'create_modifier_groups',
    '/menu/modifier-group/edit': 'update_modifier_groups',

    '/table-management/floors': 'view_floors',
    '/table-management/floor/create': 'create_floors',
    '/table-management/floor/edit': 'update_floors',
    '/table-management/tables': 'view_tables',
    '/table-management/table/create': 'create_tables',
    '/table-management/table/edit': 'update_tables',
    '/table-management/reservations': 'view_reservations',
    '/table-management/reservation/create': 'create_reservations',
    '/table-management/reservation/edit': 'update_reservations',
    '/table-management/reservation/view': 'view_reservations',

    '/pos/terminal': 'view_pos',
    '/pos/sales': 'view_pos',
    '/pos/sales/view': 'view_pos',
    '/pos/settings': 'view_pos',
    '/pos/coupons': 'view_pos',

    '/kitchen/display': 'view_kitchen_display',
    '/customer-display/settings': 'view_customer_display',

    '/inventory/list': 'view_inventory',
    '/inventory/create': 'create_inventory',
    '/inventory/edit': 'update_inventory',
    '/inventory/categories': 'view_inventory',
    '/inventory/suppliers': 'view_suppliers',
    '/inventory/customers': 'view_customers',
    '/inventory/recipes': 'view_recipes',
    '/inventory/recipe/create': 'create_recipes',
    '/inventory/recipe/edit': 'update_recipes',
    '/inventory/purchases': 'view_purchases',
    '/inventory/purchase/create': 'create_purchases',
    '/inventory/purchase/edit': 'update_purchases',
    '/inventory/purchase/view': 'view_purchases',
    '/inventory/stock': 'view_stock_movements',

    '/currency/list': 'view_currencies',
    '/currency/create': 'create_currencies',
    '/currency/edit': 'update_currencies',

    '/role/list': 'role_list',
    '/role/create': 'role_create',
    '/role/edit': 'role_edit',

    '/package/list': 'view_packages',
    '/package/create': 'create_packages',
    '/package/edit': 'update_packages',
    '/package/view': 'view_packages',

    '/subscription/list': 'view_subscriptions',
    '/subscription/create': 'create_subscriptions',
    '/subscription/edit': 'update_subscriptions',

    '/plan/list': 'view_plans',
    '/plan/create': 'create_plans',
    '/plan/edit': 'update_plans',
    '/plan/view': 'view_plans',

    '/user/list': 'view_user',
    '/user/create': 'create_user',
    '/user/edit': 'update_user',

    '/hrm/departments': 'view_departments',
    '/hrm/department/create': 'create_departments',
    '/hrm/department/edit': 'update_departments',
    '/hrm/designations': 'view_designations',
    '/hrm/designation/create': 'create_designations',
    '/hrm/designation/edit': 'update_designations',
    '/hrm/employees': 'view_employees',
    '/hrm/employee/create': 'create_employees',
    '/hrm/employee/edit': 'update_employees',
    '/hrm/employee/view': 'view_employees',
    '/hrm/attendance': 'view_attendance',
    '/hrm/attendance/create': 'create_attendance',
    '/hrm/attendance/edit': 'update_attendance',
    '/hrm/leaves': 'view_leave_requests',
    '/hrm/leave/create': 'create_leave_requests',
    '/hrm/leave/edit': 'update_leave_requests',
    '/hrm/holidays': 'view_holidays',
    '/hrm/holiday/create': 'create_holidays',
    '/hrm/holiday/edit': 'update_holidays',
    '/hrm/payroll': 'view_payrolls',
    '/hrm/payroll/create': 'create_payrolls',
    '/hrm/payroll/edit': 'update_payrolls',
    '/hrm/payroll/view': 'view_payrolls',

    '/accounting/accounts': 'view_accounts',
    '/accounting/accounts/create': 'create_accounts',
    '/accounting/accounts/edit': 'update_accounts',
    '/accounting/income': 'view_income',
    '/accounting/income/create': 'create_income',
    '/accounting/income/edit': 'update_income',
    '/accounting/expense-categories': 'view_expense_categories',
    '/accounting/expense-categories/create': 'create_expense_categories',
    '/accounting/expense-categories/edit': 'update_expense_categories',
    '/accounting/expenses': 'view_expenses',
    '/accounting/expenses/create': 'create_expenses',
    '/accounting/expenses/edit': 'update_expenses',
    '/accounting/cash-bank': 'view_cash_bank',
    '/accounting/cash-bank/create': 'create_cash_bank',
    '/accounting/cash-bank/edit': 'update_cash_bank',
    '/accounting/journal': 'view_journal_entries',
    '/accounting/journal/create': 'create_journal_entries',
    '/accounting/journal/edit': 'update_journal_entries',
    '/accounting/journal/view': 'view_journal_entries',
    '/accounting/ledger': 'view_ledger',
    '/accounting/trial-balance': 'view_trial_balance',
    '/accounting/reports/profit-loss': 'view_profit_loss_report',
    '/accounting/reports/balance-sheet': 'view_balance_sheet',
    '/accounting/reports/cash-flow': 'view_cash_flow',
    '/accounting/dashboard': 'view_accounting_dashboard',

    '/reports/sales': 'view_sale_report',
    '/reports/purchases': 'view_purchase_report',
    '/reports/taxes': 'view_tax_report',
    '/reports/expenses': 'view_expense_report',

    '/loyalty/settings': 'view_loyalty_settings',
    '/loyalty/customers': 'view_loyalty_customers',
    '/loyalty/transactions': 'view_loyalty_transactions',

    '/crm/dashboard': 'view_crm_dashboard',
    '/crm/customers': 'view_customers',
    '/crm/customer/create': 'create_customers',
    '/crm/customer/edit': 'update_customers',
    '/crm/customer/view': 'view_customers',
    '/crm/segments': 'view_segments',
    '/crm/segment/create': 'create_segments',
    '/crm/segment/edit': 'update_segments',
    '/crm/follow-ups': 'view_follow_ups',

    '/notifications': 'view_notifications',
    '/activity-logs': 'view_activity_logs',
    '/backups': 'view_backups',
};

export default function getRoutePermission(pathname) {
    if (!pathname) return null;

    if (permissions[pathname]) {
        return permissions[pathname];
    }

    const normalized = pathname.replace(/:[^/]+/g, ':id');
    if (permissions[normalized]) {
        return permissions[normalized];
    }

    const segments = normalized.split('/').filter(Boolean);
    for (let i = segments.length - 1; i >= 1; i--) {
        const partial = '/' + segments.slice(0, i).join('/');
        if (permissions[partial]) {
            return permissions[partial];
        }
    }

    return null;
}
