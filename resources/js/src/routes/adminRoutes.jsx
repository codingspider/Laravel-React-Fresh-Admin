import { ADMIN_BASE } from "./commonRoutes";

export const BRANCH_LIST = "branch/list";
export const BRANCH_ADD = "branch/create";
export const BRANCH_EDIT = "branch/edit/:id";

export const BRANCH_LIST_PATH = `${ADMIN_BASE}/branch/list`;
export const BRANCH_ADD_PATH = `${ADMIN_BASE}/branch/create`;
export const BRANCH_EDIT_PATH = (id) => `${ADMIN_BASE}/branch/edit/${id}`;

export const CATEGORY_LIST = "category/list";
export const CATEGORY_ADD = "category/create";
export const CATEGORY_EDIT = "category/edit/:id";

export const CATEGORY_LIST_PATH = `${ADMIN_BASE}/category/list`;
export const CATEGORY_ADD_PATH = `${ADMIN_BASE}/category/create`;
export const CATEGORY_EDIT_PATH = (id) => `${ADMIN_BASE}/category/edit/${id}`;

export const ADDON_LIST = "addon/list";
export const ADDON_ADD = "addon/create";
export const ADDON_EDIT = "addon/edit/:id";

export const ADDON_LIST_PATH = `${ADMIN_BASE}/addon/list`;
export const ADDON_ADD_PATH = `${ADMIN_BASE}/addon/create`;
export const ADDON_EDIT_PATH = (id) => `${ADMIN_BASE}/addon/edit/${id}`;

export const VARIATION_LIST = "variation/list";
export const VARIATION_ADD = "variation/create";
export const VARIATION_EDIT = "variation/edit/:id";

export const VARIATION_LIST_PATH = `${ADMIN_BASE}/variation/list`;
export const VARIATION_ADD_PATH = `${ADMIN_BASE}/variation/create`;
export const VARIATION_EDIT_PATH = (id) => `${ADMIN_BASE}/variation/edit/${id}`;

export const ITEM_LIST = "item/list";
export const ITEM_ADD = "item/create";
export const ITEM_EDIT = "item/edit/:id";

export const ITEM_LIST_PATH = `${ADMIN_BASE}/item/list`;
export const ITEM_ADD_PATH = `${ADMIN_BASE}/item/create`;
export const ITEM_EDIT_PATH = (id) => `${ADMIN_BASE}/item/edit/${id}`;

export const POS_SETTINGS_PATH = `${ADMIN_BASE}/pos/settings`;
export const POS_COUPONS_PATH = `${ADMIN_BASE}/pos/coupons`;

export const ADMIN_DASHBOARD_PATH = `${ADMIN_BASE}/dashboard`;
export const GENERAL_PAGE_PATH = `${ADMIN_BASE}/general`;
