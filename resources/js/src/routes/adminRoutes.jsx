import ProtectedRoute from "../ProtectedRoute";
import AdminDashboard from "../components/admin/dashboard/Dashboard";
import { ADMIN_BASE } from "./commonRoutes";

import BranchList from "../components/admin/branch/BranchList";
import BranchCreate from './../components/admin/branch/BranchCreate';
import BranchEdit from './../components/admin/branch/BranchEdit';

import CategoryList from "../components/admin/category/CategoryList";
import CategoryCreate from "../components/admin/category/CategoryCreate";
import CategoryEdit from "../components/admin/category/CategoryEdit";

import AddonList from "../components/admin/addons/AddonList";
import AddonCreate from "../components/admin/addons/AddonCreate";
import AddonEdit from "../components/admin/addons/AddonEdit";

import General from "../components/admin/general/General";
import VariationList from "../components/admin/variations/VariationList";
import VariationCreate from './../components/admin/variations/VariationCreate';
import VariationEdit from './../components/admin/variations/VariationEdit';

import ItemCreate from "../components/admin/items/ItemCreate";
import ItemList from "../components/admin/items/ItemList";

import PosSettings from "../components/admin/pos/PosSettings";
import CouponManagement from "../components/admin/pos/CouponManagement";

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

export const adminRoutes = [
    { path: ADMIN_DASHBOARD_PATH, element: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute> },
    { path: GENERAL_PAGE_PATH, element: <ProtectedRoute role="admin"><General /></ProtectedRoute> },

    { path: BRANCH_LIST_PATH, element: <ProtectedRoute role="admin"><BranchList /></ProtectedRoute> },
    { path: BRANCH_ADD_PATH, element: <ProtectedRoute role="admin"><BranchCreate /></ProtectedRoute> },
    { path: BRANCH_EDIT, element: <ProtectedRoute role="admin"><BranchEdit /></ProtectedRoute> },
    
    { path: CATEGORY_LIST_PATH, element: <ProtectedRoute role="admin"><CategoryList /></ProtectedRoute> },
    { path: CATEGORY_ADD_PATH, element: <ProtectedRoute role="admin"><CategoryCreate /></ProtectedRoute> },
    { path: CATEGORY_EDIT, element: <ProtectedRoute role="admin"><CategoryEdit /></ProtectedRoute> },
    
    { path: ADDON_LIST_PATH, element: <ProtectedRoute role="admin"><AddonList /></ProtectedRoute> },
    { path: ADDON_ADD_PATH, element: <ProtectedRoute role="admin"><AddonCreate /></ProtectedRoute> },
    { path: ADDON_EDIT, element: <ProtectedRoute role="admin"><AddonEdit /></ProtectedRoute> },
    
    { path: VARIATION_LIST_PATH, element: <ProtectedRoute role="admin"><VariationList /></ProtectedRoute> },
    { path: VARIATION_ADD_PATH, element: <ProtectedRoute role="admin"><VariationCreate /></ProtectedRoute> },
    { path: VARIATION_EDIT, element: <ProtectedRoute role="admin"><VariationEdit /></ProtectedRoute> },

    { path: ITEM_ADD_PATH, element: <ProtectedRoute role="admin"><ItemCreate /></ProtectedRoute> },
    { path: ITEM_LIST_PATH, element: <ProtectedRoute role="admin"><ItemList /></ProtectedRoute> },

    { path: POS_SETTINGS_PATH, element: <ProtectedRoute role="admin"><PosSettings /></ProtectedRoute> },
    { path: POS_COUPONS_PATH, element: <ProtectedRoute role="admin"><CouponManagement /></ProtectedRoute> },
];
