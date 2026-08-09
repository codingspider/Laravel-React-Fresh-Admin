import Dexie from 'dexie';

export const db = new Dexie('restaurantApp');

const VERSION = 2;

db.version(1).stores({
    users: '++id,name,email,isSynced',
    branches: 'id,name,business_id',
    variations: 'id,branch_id',
    variation_items: 'id,variation_id',
    addons: 'id,name,branch_id',
    categories: 'id,name',
});

db.version(VERSION).stores({
    users: '++id,name,email,isSynced',
    branches: 'id,name,business_id',
    variations: 'id,branch_id',
    variation_items: 'id,variation_id',
    addons: 'id,name,branch_id',
    categories: 'id,name',

    menu_items: 'id,name,category_id,branch_id,isSynced',
    modifier_groups: 'id,name,branch_id,isSynced',
    coupons: 'id,code,branch_id,is_valid',
    tables: 'id,name,branch_id,status',
    customers: 'id,name,email,phone',
    reservations: 'id,name,branch_id,status,date',
    pos_settings: 'id,branch_id',
    invoice_settings: 'id,branch_id',
    customer_display_settings: 'id,branch_id',
    kitchen_display_settings: 'id,branch_id',

    orders: '++id,temp_id,sale_id,status,order_type,branch_id,table_id,customer_id,isSynced,createdAt,updatedAt',
    order_items: 'id,order_id,menu_item_id,quantity',

    offline_sales: 'id,sale_id,status,branch_id,isSynced,createdAt,syncAttempts',
    held_orders: 'id,sale_id,temp_id,branch_id,status,isSynced,createdAt',
    kds_board: 'id,status,branch_id',

    sync_status: 'id,key,value',

    queue: '++id,method,url,status,temp_id,attempts,createdAt,error,[status+createdAt]',
});

db.open().catch((err) => console.error("Dexie open failed:", err));

export const TABLES = {
    USERS: 'users',
    BRANCHES: 'branches',
    VARIATIONS: 'variations',
    VARIATION_ITEMS: 'variation_items',
    ADDONS: 'addons',
    CATEGORIES: 'categories',
    MENU_ITEMS: 'menu_items',
    MODIFIER_GROUPS: 'modifier_groups',
    COUPONS: 'coupons',
    TABLES: 'tables',
    CUSTOMERS: 'customers',
    RESERVATIONS: 'reservations',
    POS_SETTINGS: 'pos_settings',
    INVOICE_SETTINGS: 'invoice_settings',
    CUSTOMER_DISPLAY_SETTINGS: 'customer_display_settings',
    KITCHEN_DISPLAY_SETTINGS: 'kitchen_display_settings',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    OFFLINE_SALES: 'offline_sales',
    HELD_ORDERS: 'held_orders',
    KDS_BOARD: 'kds_board',
    SYNC_STATUS: 'sync_status',
    QUEUE: 'queue',
};

export default db;