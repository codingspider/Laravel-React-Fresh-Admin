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
export const GET_EDIT_SUBSCRIPTION = (id) => `/v1/subscriptions/${id}/edit`;
export const UPDATE_SUBSCRIPTION = (id) => `/v1/subscriptions/${id}`;
export const DELETE_SUBSCRIPTION = (id) => `/v1/subscriptions/${id}`;

// Module access
export const GET_ALLOWED_MODULES = '/v1/subscription/modules';

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
export const LIST_MODIFIER_GROUP = '/v1/modifier-groups';
export const STORE_MODIFIER_GROUP = '/v1/modifier-groups';
export const GET_MODIFIER_GROUP = (id) => `/v1/modifier-groups/${id}`;
export const UPDATE_MODIFIER_GROUP = (id) => `/v1/modifier-groups/${id}`;
export const DELETE_MODIFIER_GROUP = (id) => `/v1/modifier-groups/${id}`;

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
export const POS_START_SESSION = '/v1/pos/sessions/start';
export const POS_CLOSE_SESSION = (id) => `/v1/pos/sessions/${id}/close`;
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

// Customers
export const LIST_CUSTOMER = '/v1/customers';
export const STORE_CUSTOMER = '/v1/customers';
export const GET_CUSTOMER = (id) => `/v1/customers/${id}`;
export const UPDATE_CUSTOMER = (id) => `/v1/customers/${id}`;
export const DELETE_CUSTOMER = (id) => `/v1/customers/${id}`;
