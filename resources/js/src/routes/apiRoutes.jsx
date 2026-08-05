// Plan
export const LIST_PLAN = '/v1/plans';
export const STORE_PLAN = '/v1/plans';
export const GET_EDIT_PLAN = (id) => `/v1/plans/${id}`;
export const UPDATE_PLAN = (id) => `/v1/plans/${id}`;
export const DELETE_PLAN = (id) => `/v1/plans/${id}`;

// Business
export const STORE_BUSINESS = '/business';
export const LIST_BUSINESS = '/business';
export const DELETE_BUSINESS = (id) => `/business/${id}`;
export const GET_CURRENCIES = 'get/currencies';
export const GET_TIMEZONES = 'get/timezones';
export const STORE_BUSINESS_INFO = 'store/business/info';
export const SET_PERMISSION = 'set-permission';

export const GET_ALL_PLANS = '/get/all/plans';
export const GET_ALL_BRANCHES = 'get/branches';
export const GET_ALL_LOCATIONS = 'get/locations';
export const GET_ALL_ROLES = 'get/roles';

// VAT
export const STORE_VAT = '/vats';
export const LIST_VAT = '/vats';
export const DELETE_VAT = (id) => `/vats/${id}`;
export const UPDATE_VAT = (id) => `/vats/${id}`;

export const UPDATE_BUSINESS = (id) => `/business/setting/update/${id}`;
export const UPDATE_RESTAURANT_CURRENCY = '/update/currency';
export const GET_OWNER_BUSINESS = '/owner/business';
export const CREATE_NOTIFICATION_SETTING = '/notification/update';
export const GET_NOTIFICATION_SETTING = '/get/notification/setting';
export const UPDATE_INVOICE_SETTING = '/update/invoice/setting';
export const GET_INVOICE_SETTING = '/get/invoice/setting';
export const GET_BRANCH_ADDONS = '/get/all/addons';
export const GET_BRANCH_VARIATIONS = '/get/all/variations';
export const GET_ALL_CATEGROIES = '/get/all/categories';

// Addon
export const STORE_ADDON = '/addons';
export const LIST_ADDON = '/addons';
export const DELETE_ADDON = (id) => `/addons/${id}`;
export const UPDATE_ADDON = (id) => `/addons/${id}`;

// Variation
export const STORE_VARIATION = '/variations';
export const LIST_VARIATION = '/variations';
export const DELETE_VARIATION = (id) => `/variations/${id}`;
export const UPDATE_VARIATION = (id) => `/variations/${id}`;

// Inventory Items
export const STORE_INVENTORY_ITEM = '/inventory-items';
export const LIST_INVENTORY_ITEM = '/inventory-items';
export const DELETE_INVENTORY_ITEM = (id) => `/inventory-items/${id}`;
export const UPDATE_INVENTORY_ITEM = (id) => `/inventory-items/${id}`;
export const GET_EDIT_INVENTORY_ITEM = (id) => `/inventory-items/${id}`;

// Inventory Categories
export const STORE_INVENTORY_CATEGORY = '/inventory-categories';
export const LIST_INVENTORY_CATEGORY = '/inventory-categories';
export const DELETE_INVENTORY_CATEGORY = (id) => `/inventory-categories/${id}`;
export const UPDATE_INVENTORY_CATEGORY = (id) => `/inventory-categories/${id}`;

// Suppliers
export const STORE_SUPPLIER = '/suppliers';
export const LIST_SUPPLIER = '/suppliers';
export const DELETE_SUPPLIER = (id) => `/suppliers/${id}`;
export const UPDATE_SUPPLIER = (id) => `/suppliers/${id}`;

// Category (super)
export const STORE_CATEGORY = '/categories';
export const LIST_CATEGORY = '/categories';
export const DELETE_CATEGORY = (id) => `/categories/${id}`;
export const UPDATE_CATEGORY = (id) => `/categories/${id}`;
export const GET_EDIT_CATEGORY = (id) => `/categories/${id}`;

// Unit
export const STORE_UNIT = '/units';
export const LIST_UNIT = '/units';
export const DELETE_UNIT = (id) => `/units/${id}`;
export const UPDATE_UNIT = (id) => `/units/${id}`;
export const GET_EDIT_UNIT = (id) => `/units/${id}`;

// Recipes
export const STORE_RECIPE = '/recipes';
export const LIST_RECIPE = '/recipes';
export const DELETE_RECIPE = (id) => `/recipes/${id}`;
export const UPDATE_RECIPE = (id) => `/recipes/${id}`;
export const GET_EDIT_RECIPE = (id) => `/recipes/${id}`;
export const RECIPE_OPTIONS = '/recipe/options';

// Recipe Categories
export const STORE_RECIPE_CATEGORY = '/recipe-categories';
export const LIST_RECIPE_CATEGORY = '/recipe-categories';
export const DELETE_RECIPE_CATEGORY = (id) => `/recipe-categories/${id}`;
export const UPDATE_RECIPE_CATEGORY = (id) => `/recipe-categories/${id}`;
export const GET_EDIT_RECIPE_CATEGORY = (id) => `/recipe-categories/${id}`;

// Purchases
export const STORE_PURCHASE = '/purchases';
export const LIST_PURCHASE = '/purchases';
export const DELETE_PURCHASE = (id) => `/purchases/${id}`;
export const UPDATE_PURCHASE = (id) => `/purchases/${id}`;
export const GET_EDIT_PURCHASE = (id) => `/purchases/${id}`;
export const RECEIVE_GOODS = (id) => `/purchases/${id}/receive-goods`;
export const ADD_PURCHASE_PAYMENT = (id) => `/purchases/${id}/payments`;
export const LIST_PURCHASE_PAYMENTS = (id) => `/purchases/${id}/payments`;
export const CREATE_PURCHASE_RETURN = (id) => `/purchases/${id}/returns`;
export const LIST_PURCHASE_RETURNS = (id) => `/purchases/${id}/returns`;

// Inventory stock movements
export const STOCK_OVERVIEW = '/inventory/overview';
export const STOCK_TRANSACTIONS = '/inventory/transactions';
export const STOCK_BATCHES = '/inventory/batches';
export const STOCK_TRANSFERS = '/inventory/transfers';
export const RECEIVE_STOCK_TRANSFER = (id) => `/inventory/transfers/${id}/receive`;
export const STOCK_WASTES = '/inventory/wastes';
export const STOCK_ADJUSTMENTS = '/inventory/adjustments';
export const APPROVE_STOCK_ADJUSTMENT = (id) => `/inventory/adjustments/${id}/approve`;
export const ADJUST_ITEM_STOCK = (id) => `/inventory/items/${id}/adjust-stock`;

// Supplier CRM
export const SUPPLIER_OVERVIEW = (id) => `/suppliers/${id}/overview`;
export const SUPPLIER_CONTACTS = (id) => `/suppliers/${id}/contacts`;
export const DELETE_SUPPLIER_CONTACT = (id, contactId) => `/suppliers/${id}/contacts/${contactId}`;
export const SUPPLIER_DOCUMENTS = (id) => `/suppliers/${id}/documents`;
export const DELETE_SUPPLIER_DOCUMENT = (id, documentId) => `/suppliers/${id}/documents/${documentId}`;
export const SUPPLIER_TRANSACTIONS = (id) => `/suppliers/${id}/transactions`;
export const STORE_SUPPLIER_TRANSACTION = (id) => `/suppliers/${id}/transactions`;
export const RATE_SUPPLIER = (id) => `/suppliers/${id}/rate`;

// Role
export const STORE_ROLE = '/roles';
export const LIST_ROLE = '/roles';
export const DELETE_ROLE = (id) => `/roles/${id}`;
export const UPDATE_ROLE = (id) => `/roles/${id}`;
export const GET_EDIT_ROLE = (id) => `/roles/${id}`;

// User
export const STORE_USER = '/user-management';
export const LIST_USER = '/user-management';
export const DELETE_USER = (id) => `/user-management/${id}`;
export const UPDATE_USER = (id) => `/user-management/${id}`;
export const GET_EDIT_USER = (id) => `/user-management/${id}`;

// Currency
export const LIST_CURRENCY = '/v1/currencies';
export const STORE_CURRENCY = '/v1/currencies';
export const GET_CURRENCY = (id) => `/v1/currencies/${id}`;
export const UPDATE_CURRENCY = (id) => `/v1/currencies/${id}`;
export const DELETE_CURRENCY = (id) => `/v1/currencies/${id}`;

// Package
export const LIST_PACKAGE = '/v1/packages';
export const STORE_PACKAGE = '/v1/packages';
export const GET_EDIT_PACKAGE = (id) => `/v1/packages/${id}`;
export const UPDATE_PACKAGE = (id) => `/v1/packages/${id}`;
export const DELETE_PACKAGE = (id) => `/v1/packages/${id}`;

// Subscription
export const LIST_SUBSCRIPTION = '/v1/subscriptions';
export const STORE_SUBSCRIPTION = '/v1/subscriptions';
export const GET_EDIT_SUBSCRIPTION = (id) => `/v1/subscriptions/${id}`;
export const UPDATE_SUBSCRIPTION = (id) => `/v1/subscriptions/${id}`;
export const DELETE_SUBSCRIPTION = (id) => `/v1/subscriptions/${id}`;

// Module access
export const GET_ALLOWED_MODULES = '/v1/subscription/modules';

// HRM — Departments
export const LIST_DEPARTMENT = '/departments';
export const STORE_DEPARTMENT = '/departments';
export const GET_DEPARTMENT = (id) => `/departments/${id}`;
export const UPDATE_DEPARTMENT = (id) => `/departments/${id}`;
export const DELETE_DEPARTMENT = (id) => `/departments/${id}`;

// HRM — Designations
export const LIST_DESIGNATION = '/designations';
export const STORE_DESIGNATION = '/designations';
export const GET_DESIGNATION = (id) => `/designations/${id}`;
export const UPDATE_DESIGNATION = (id) => `/designations/${id}`;
export const DELETE_DESIGNATION = (id) => `/designations/${id}`;
export const GET_DESIGNATION_BY_DEPARTMENT = (departmentId) => `/designations/departments/${departmentId}`;

// HRM — Employees
export const LIST_EMPLOYEE = '/employees';
export const STORE_EMPLOYEE = '/employees';
export const GET_EMPLOYEE = (id) => `/employees/${id}`;
export const UPDATE_EMPLOYEE = (id) => `/employees/${id}`;
export const DELETE_EMPLOYEE = (id) => `/employees/${id}`;
export const EMPLOYEE_OPTIONS = '/employee/options';

// HRM — Attendance
export const LIST_ATTENDANCE = '/attendance';
export const STORE_ATTENDANCE = '/attendance';
export const GET_ATTENDANCE = (id) => `/attendance/${id}`;
export const UPDATE_ATTENDANCE = (id) => `/attendance/${id}`;
export const DELETE_ATTENDANCE = (id) => `/attendance/${id}`;

// HRM — Leave Requests
export const LIST_LEAVE = '/leaves';
export const STORE_LEAVE = '/leaves';
export const GET_LEAVE = (id) => `/leaves/${id}`;
export const UPDATE_LEAVE = (id) => `/leaves/${id}`;
export const DELETE_LEAVE = (id) => `/leaves/${id}`;
export const APPROVE_LEAVE = (id) => `/leaves/${id}/approve`;

// HRM — Holidays
export const LIST_HOLIDAY = '/holidays';
export const STORE_HOLIDAY = '/holidays';
export const GET_HOLIDAY = (id) => `/holidays/${id}`;
export const UPDATE_HOLIDAY = (id) => `/holidays/${id}`;
export const DELETE_HOLIDAY = (id) => `/holidays/${id}`;

// HRM — Payroll
export const LIST_PAYROLL = '/payrolls';
export const STORE_PAYROLL = '/payrolls';
export const GET_PAYROLL = (id) => `/payrolls/${id}`;
export const UPDATE_PAYROLL = (id) => `/payrolls/${id}`;
export const DELETE_PAYROLL = (id) => `/payrolls/${id}`;

// Accounting - Chart of Accounts
export const LIST_ACCOUNT = '/accounts';
export const STORE_ACCOUNT = '/accounts';
export const GET_ACCOUNT = (id) => `/accounts/${id}`;
export const UPDATE_ACCOUNT = (id) => `/accounts/${id}`;
export const DELETE_ACCOUNT = (id) => `/accounts/${id}`;
export const ACCOUNT_TREE = '/accounts/tree';

// Accounting - Income
export const LIST_INCOME = '/income';
export const STORE_INCOME = '/income';
export const GET_INCOME = (id) => `/income/${id}`;
export const UPDATE_INCOME = (id) => `/income/${id}`;
export const DELETE_INCOME = (id) => `/income/${id}`;
export const INCOME_SUMMARY = '/income/summary';

// Accounting - Expense
export const LIST_EXPENSE = '/expenses';
export const STORE_EXPENSE = '/expenses';
export const GET_EXPENSE = (id) => `/expenses/${id}`;
export const UPDATE_EXPENSE = (id) => `/expenses/${id}`;
export const DELETE_EXPENSE = (id) => `/expenses/${id}`;
export const EXPENSE_SUMMARY = '/expenses/summary';
export const LIST_EXPENSE_CATEGORY = '/expense-categories';
export const STORE_EXPENSE_CATEGORY = '/expense-categories';
export const GET_EXPENSE_CATEGORY = (id) => `/expense-categories/${id}`;
export const UPDATE_EXPENSE_CATEGORY = (id) => `/expense-categories/${id}`;
export const DELETE_EXPENSE_CATEGORY = (id) => `/expense-categories/${id}`;

// Accounting - Cash & Bank
export const LIST_CASH_BANK = '/cash-bank';
export const STORE_CASH_BANK = '/cash-bank';
export const GET_CASH_BANK = (id) => `/cash-bank/${id}`;
export const UPDATE_CASH_BANK = (id) => `/cash-bank/${id}`;
export const DELETE_CASH_BANK = (id) => `/cash-bank/${id}`;
export const CASH_BANK_ACCOUNTS = '/cash-bank/accounts';

// Accounting - Journal Entries
export const LIST_JOURNAL = '/journal';
export const GET_JOURNAL = (id) => `/journal/${id}`;
export const LEDGER_ACCOUNTS = '/journal/ledger';
export const LEDGER_BY_ACCOUNT = (accountId) => `/journal/ledger/account/${accountId}`;
export const TRIAL_BALANCE = '/journal/trial-balance';

// Accounting - Reports
export const PROFIT_LOSS_REPORT = '/reports/profit-and-loss';
export const BALANCE_SHEET_REPORT = '/reports/balance-sheet';
export const CASH_FLOW_REPORT = '/reports/cash-flow';

export const EXPORT_TEXT_FROM_IMAGE = "/extract-text-from-image";

// ===== Phase 1 Module API Routes =====

// Restaurant
export const LIST_RESTAURANT = '/v1/restaurants';
export const STORE_RESTAURANT = '/v1/restaurants';
export const GET_RESTAURANT = (id) => `/v1/restaurants/${id}`;
export const UPDATE_RESTAURANT = (id) => `/v1/restaurants/${id}`;
export const DELETE_RESTAURANT = (id) => `/v1/restaurants/${id}`;
export const UPDATE_RESTAURANT_WORKING_HOURS = (id) => `/v1/restaurants/${id}/working-hours`;
export const UPDATE_RESTAURANT_TAX = (id) => `/v1/restaurants/${id}/tax-settings`;

// Branch
export const LIST_BRANCH = '/v1/branches';
export const LIST_BRANCH_V1 = '/v1/branches';
export const STORE_BRANCH = '/v1/branches';
export const STORE_BRANCH_V1 = '/v1/branches';
export const GET_BRANCH = (id) => `/v1/branches/${id}`;
export const GET_BRANCH_V1 = (id) => `/v1/branches/${id}`;
export const GET_EDIT_BRANCH = (id) => `/v1/branches/${id}`;
export const UPDATE_BRANCH = (id) => `/v1/branches/${id}`;
export const UPDATE_BRANCH_V1 = (id) => `/v1/branches/${id}`;
export const DELETE_BRANCH = (id) => `/v1/branches/${id}`;
export const DELETE_BRANCH_V1 = (id) => `/v1/branches/${id}`;

// Menu Categories
export const LIST_MENU_CATEGORY = '/v1/menu/categories';
export const STORE_MENU_CATEGORY = '/v1/menu/categories';
export const GET_MENU_CATEGORY = (id) => `/v1/menu/categories/${id}`;
export const UPDATE_MENU_CATEGORY = (id) => `/v1/menu/categories/${id}`;
export const DELETE_MENU_CATEGORY = (id) => `/v1/menu/categories/${id}`;
export const GET_MENU_CATEGORY_TREE = '/v1/menu/categories/tree';

// Menu Items
export const LIST_MENU_ITEM = '/v1/menu/items';
export const STORE_MENU_ITEM = '/v1/menu/items';
export const GET_MENU_ITEM = (id) => `/v1/menu/items/${id}`;
export const UPDATE_MENU_ITEM = (id) => `/v1/menu/items/${id}`;
export const DELETE_MENU_ITEM = (id) => `/v1/menu/items/${id}`;

// Modifier Groups
export const LIST_MODIFIER_GROUP = '/v1/menu/modifier-groups';
export const STORE_MODIFIER_GROUP = '/v1/menu/modifier-groups';
export const GET_MODIFIER_GROUP = (id) => `/v1/menu/modifier-groups/${id}`;
export const UPDATE_MODIFIER_GROUP = (id) => `/v1/menu/modifier-groups/${id}`;
export const DELETE_MODIFIER_GROUP = (id) => `/v1/menu/modifier-groups/${id}`;

// Floors
export const LIST_FLOOR = '/v1/floors';
export const STORE_FLOOR = '/v1/floors';
export const GET_FLOOR = (id) => `/v1/floors/${id}`;
export const UPDATE_FLOOR = (id) => `/v1/floors/${id}`;
export const DELETE_FLOOR = (id) => `/v1/floors/${id}`;

// Tables
export const LIST_TABLE = '/v1/tables';
export const STORE_TABLE = '/v1/tables';
export const GET_TABLE = (id) => `/v1/tables/${id}`;
export const UPDATE_TABLE = (id) => `/v1/tables/${id}`;
export const DELETE_TABLE = (id) => `/v1/tables/${id}`;
export const UPDATE_TABLE_STATUS = (id) => `/v1/tables/${id}/status`;
export const GET_AVAILABLE_TABLES = '/v1/tables/available';

// Reservations
export const LIST_RESERVATION = '/v1/reservations';
export const STORE_RESERVATION = '/v1/reservations';
export const GET_RESERVATION = (id) => `/v1/reservations/${id}`;
export const UPDATE_RESERVATION = (id) => `/v1/reservations/${id}`;
export const DELETE_RESERVATION = (id) => `/v1/reservations/${id}`;
export const CONFIRM_RESERVATION = (id) => `/v1/reservations/${id}/confirm`;
export const CANCEL_RESERVATION = (id) => `/v1/reservations/${id}/cancel`;
export const SEAT_RESERVATION = (id) => `/v1/reservations/${id}/seat`;
export const COMPLETE_RESERVATION = (id) => `/v1/reservations/${id}/complete`;

// POS
export const POS_START_SESSION = '/v1/pos/sessions/start'; export const POS_CLOSE_SESSION = (id) => `/v1/pos/sessions/${id}/close`;
export const POS_OPEN_SESSION = '/v1/pos/sessions/open';
export const LIST_POS_SALES = '/v1/pos';
export const STORE_POS_SALE = '/v1/pos';
export const GET_POS_SALE = (id) => `/v1/pos/${id}`;
export const POS_HELD_ORDERS = '/v1/pos/held';
export const POS_MERGE_BILLS = '/v1/pos/merge';
export const POS_PROCESS_PAYMENT = (id) => `/v1/pos/${id}/payments`;
export const POS_PROCESS_MULTIPLE_PAYMENTS = (id) => `/v1/pos/${id}/payments/multiple`;
export const POS_PROCESS_REFUND = (id) => `/v1/pos/${id}/refund`;
export const POS_HOLD_ORDER = (id) => `/v1/pos/${id}/hold`;
export const POS_RECALL_ORDER = (id) => `/v1/pos/${id}/recall`;
export const POS_CANCEL_SALE = (id) => `/v1/pos/${id}/cancel`;
export const POS_ADD_ITEM = (saleId) => `/v1/pos/${saleId}/items`;
export const POS_REMOVE_ITEM = (saleId, itemId) => `/v1/pos/${saleId}/items/${itemId}`;
export const POS_SETTINGS = '/v1/pos/settings';
export const POS_COUPONS = '/v1/pos/coupons';
export const POS_COUPON = (id) => `/v1/pos/coupons/${id}`;
export const POS_VALIDATE_COUPON = '/v1/pos/coupons/validate';
export const POS_REFUND = (saleId) => `/v1/pos/${saleId}/refund`;

// Kitchen Display System (KDS)
export const KDS_BOARD = '/v1/kitchen/display';
export const KDS_CHEFS = '/v1/kitchen/chefs';
export const KDS_UPDATE_STATUS = (saleId) => `/v1/kitchen/orders/${saleId}/status`;
export const KDS_SET_PRIORITY = (saleId) => `/v1/kitchen/orders/${saleId}/priority`;
export const KDS_ASSIGN_CHEF = (saleId) => `/v1/kitchen/orders/${saleId}/chef`;

// Customer Display System (CDS)
export const CUSTOMER_DISPLAY_BOARD = '/v1/customer-display';
export const CUSTOMER_DISPLAY_SETTINGS = '/v1/customer-display/settings';

// Customers
export const LIST_CUSTOMER = '/v1/customers';
export const STORE_CUSTOMER = '/v1/customers';
export const GET_CUSTOMER = (id) => `/v1/customers/${id}`;
export const UPDATE_CUSTOMER = (id) => `/v1/customers/${id}`;
export const DELETE_CUSTOMER = (id) => `/v1/customers/${id}`;
