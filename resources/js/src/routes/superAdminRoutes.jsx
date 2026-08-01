import ProtectedRoute from "../ProtectedRoute";
import Dashboard from "../components/superadmin/Dashboard";
import MasterSetting from "../components/superadmin/MasterSetting";
import SaveOrder from "../components/order/SaveOrder";

import UserList from "../components/user/UserList";
import UserCreate from "../components/user/UserCreate";
import UserEdit from './../components/user/UserEdit';

import PlanList from "../components/superadmin/plan/PlanList";
import PlanCreate from "../components/superadmin/plan/PlanCreate";
import PlanView from "../components/superadmin/plan/PlanView";
import PlanEdit from "../components/superadmin/plan/PlanEdit";

import PackageList from "../components/superadmin/package/PackageList";
import PackageCreate from "../components/superadmin/package/PackageCreate";
import PackageEdit from "../components/superadmin/package/PackageEdit";
import PackageView from "../components/superadmin/package/PackageView";

import SubscriptionList from "../components/superadmin/subscription/SubscriptionList";
import SubscriptionCreate from "../components/superadmin/subscription/SubscriptionCreate";
import SubscriptionEdit from "../components/superadmin/subscription/SubscriptionEdit";

import BusinessList from "../components/superadmin/Business/BusinessList";
import BusinessCreate from "../components/superadmin/Business/BusinessCreate";
import BusinessEdit from "../components/superadmin/Business/BusinessEdit";

import CategoryList from "../components/superadmin/category/CategoryList";
import CategoryCreate from "../components/superadmin/category/CategoryCreate";
import CategoryEdit from "../components/superadmin/category/CategoryEdit";

import UnitList from "../components/superadmin/unit/UnitList";
import UnitCreate from "../components/superadmin/unit/UnitCreate";
import UnitEdit from "../components/superadmin/unit/UnitEdit";

import RoleList from "../components/superadmin/permission/List";
import RoleCreate from "../components/superadmin/permission/Create";
import RoleEdit from "../components/superadmin/permission/Edit";
import Profile from './../components/user/Profile';

import InventoryItemList from "../components/admin/inventory/InventoryItemList";
import InventoryItemCreate from "../components/admin/inventory/InventoryItemCreate";
import InventoryItemEdit from "../components/admin/inventory/InventoryItemEdit";
import InventoryCategoryList from "../components/admin/inventory/InventoryCategoryList";
import InventoryCategoryCreate from "../components/admin/inventory/InventoryCategoryCreate";
import InventoryCategoryEdit from "../components/admin/inventory/InventoryCategoryEdit";

import SupplierList from "../components/admin/supplier/SupplierList";
import SupplierCreate from "../components/admin/supplier/SupplierCreate";
import SupplierEdit from "../components/admin/supplier/SupplierEdit";

import CustomerList from "../components/admin/customer/CustomerList";
import CustomerCreate from "../components/admin/customer/CustomerCreate";
import CustomerEdit from "../components/admin/customer/CustomerEdit";

import CurrencyList from "../components/admin/currency/CurrencyList";
import CurrencyCreate from "../components/admin/currency/CurrencyCreate";
import CurrencyEdit from "../components/admin/currency/CurrencyEdit";

// Phase 1 — Restaurant
import RestaurantList from "../components/restaurant/RestaurantList";
import RestaurantCreate from "../components/restaurant/RestaurantCreate";
import RestaurantEdit from "../components/restaurant/RestaurantEdit";
import RestaurantView from "../components/restaurant/RestaurantView";

import BranchList from "../components/branch/BranchList";
import BranchCreate from "../components/branch/BranchCreate";
import BranchEdit from "../components/branch/BranchEdit";
import BranchView from "../components/branch/BranchView";

import MenuCategoryList from "../components/menu/MenuCategoryList";
import MenuCategoryCreate from "../components/menu/MenuCategoryCreate";
import MenuCategoryEdit from "../components/menu/MenuCategoryEdit";
import MenuItemList from "../components/menu/MenuItemList";
import MenuItemCreate from "../components/menu/MenuItemCreate";
import MenuItemEdit from "../components/menu/MenuItemEdit";
import ModifierGroupList from "../components/menu/ModifierGroupList";
import ModifierGroupCreate from "../components/menu/ModifierGroupCreate";
import ModifierGroupEdit from "../components/menu/ModifierGroupEdit";

import FloorList from "../components/table/FloorList";
import FloorCreate from "../components/table/FloorCreate";
import FloorEdit from "../components/table/FloorEdit";
import TableList from "../components/table/TableList";
import TableCreate from "../components/table/TableCreate";
import TableEdit from "../components/table/TableEdit";
import ReservationList from "../components/table/ReservationList";
import ReservationCreate from "../components/table/ReservationCreate";
import ReservationEdit from "../components/table/ReservationEdit";

import POSScreen from "../components/pos/POSScreen";
import POSSalesList from "../components/pos/POSSalesList";
import POSSalesView from "../components/pos/POSSalesView";
import PosSettings from "../components/admin/pos/PosSettings";
import CouponManagement from "../components/admin/pos/CouponManagement";


export const DASHBOARD_PATH = `/dashboard`;

export const RESTAURANT_LIST_PATH = "/restaurant/list";
export const RESTAURANT_ADD_PATH = "/restaurant/create";
export const RESTAURANT_VIEW_PATH = "/restaurant/view/:id";
export const RESTAURANT_EDIT_PATH = "/restaurant/edit/:id";

export const USER_LIST_PATH = "/user/list";
export const USER_ADD_PATH = "/user/create";
export const USER_EDIT_PATH = "/user/edit/:id";

export const PLAN_LIST_PATH = "/plan/list";
export const PLAN_ADD_PATH = "/plan/create";
export const PLAN_VIEW_PATH = "/plan/view/:id";
export const PLAN_EDIT_PATH = "/plan/edit/:id";

export const BUSINESS_LIST_PATH = "/business/list";
export const BUSINESS_ADD_PATH = "/business/create";
export const BUSINESS_EDIT_PATH = "/business/edit/:id";

export const CATEGORY_LIST_PATH = "/category/list";
export const CATEGORY_ADD_PATH = "/category/create";
export const CATEGORY_EDIT = "/category/edit/:id";

export const UNIT_LIST_PATH = "/unit/list";
export const UNIT_ADD_PATH = "/unit/create";
export const UNIT_EDIT = "/unit/edit/:id";

export const ROLE_LIST_PATH = "/role/list";
export const ROLE_ADD_PATH = "/role/create";
export const ROLE_EDIT_PATH = "/role/edit/:id";

export const PACKAGE_LIST_PATH = "/package/list";
export const PACKAGE_ADD_PATH = "/package/create";
export const PACKAGE_VIEW_PATH = "/package/view/:id";
export const PACKAGE_EDIT_PATH = "/package/edit/:id";

export const SUBSCRIPTION_LIST_PATH = "/subscription/list";
export const SUBSCRIPTION_ADD_PATH = "/subscription/create";
export const SUBSCRIPTION_EDIT_PATH = "/subscription/edit/:id";

export const INVENTORY_ITEM_LIST_PATH = "/inventory/list";
export const INVENTORY_ITEM_ADD_PATH = "/inventory/create";
export const INVENTORY_ITEM_EDIT = "/inventory/edit/:id";
export const INVENTORY_ITEM_EDIT_PATH = (id) => `/inventory/edit/${id}`;

export const INVENTORY_CATEGORY_LIST_PATH = "/inventory/categories";
export const INVENTORY_CATEGORY_ADD_PATH = "/inventory/category/create";
export const INVENTORY_CATEGORY_EDIT = "/inventory/category/edit/:id";
export const INVENTORY_CATEGORY_EDIT_PATH = (id) => `/inventory/category/edit/${id}`;

export const SUPPLIER_LIST_PATH = "/inventory/suppliers";
export const SUPPLIER_ADD_PATH = "/inventory/supplier/create";
export const SUPPLIER_EDIT = "/inventory/supplier/edit/:id";
export const SUPPLIER_EDIT_PATH = (id) => `/inventory/supplier/edit/${id}`;

export const CUSTOMER_LIST_PATH = "/inventory/customers";
export const CUSTOMER_ADD_PATH = "/inventory/customer/create";
export const CUSTOMER_EDIT = "/inventory/customer/edit/:id";
export const CUSTOMER_EDIT_PATH = (id) => `/inventory/customer/edit/${id}`;

export const CURRENCY_LIST_PATH = "/currency/list";
export const CURRENCY_ADD_PATH = "/currency/create";
export const CURRENCY_EDIT = "/currency/edit/:id";
export const CURRENCY_EDIT_PATH = (id) => `/currency/edit/${id}`;

export const PROFILE = "/profile";

export const superAdminRoutes = [
    { path: DASHBOARD_PATH, element: <Dashboard /> },
    { path: `/settings`, element: <MasterSetting /> },
    { path: `/save/order`, element: <SaveOrder /> },

    { path: USER_LIST_PATH, element: <UserList /> },
    { path: USER_ADD_PATH, element: <UserCreate /> },
    { path: USER_EDIT_PATH, element: <UserEdit /> },

    { path: PLAN_LIST_PATH, element: <PlanList /> },
    { path: PLAN_ADD_PATH, element: <PlanCreate /> },
    { path: PLAN_VIEW_PATH, element: <PlanView /> },
    { path: PLAN_EDIT_PATH, element: <PlanEdit /> },

    { path: BUSINESS_LIST_PATH, element: <BusinessList /> },
    { path: BUSINESS_ADD_PATH, element: <BusinessCreate /> },
    { path: BUSINESS_EDIT_PATH, element: <BusinessEdit /> },

    { path: CATEGORY_LIST_PATH, element: <CategoryList /> },
    { path: CATEGORY_ADD_PATH, element: <CategoryCreate /> },
    { path: CATEGORY_EDIT, element: <CategoryEdit /> },

    { path: UNIT_LIST_PATH, element: <UnitList /> },
    { path: UNIT_ADD_PATH, element: <UnitCreate /> },
    { path: UNIT_EDIT, element: <UnitEdit /> },

    { path: ROLE_LIST_PATH, element: <RoleList /> },
    { path: ROLE_ADD_PATH, element: <RoleCreate /> },
    { path: ROLE_EDIT_PATH, element: <RoleEdit /> },

    { path: PACKAGE_LIST_PATH, element: <PackageList /> },
    { path: PACKAGE_ADD_PATH, element: <PackageCreate /> },
    { path: PACKAGE_VIEW_PATH, element: <PackageView /> },
    { path: PACKAGE_EDIT_PATH, element: <PackageEdit /> },

    { path: SUBSCRIPTION_LIST_PATH, element: <SubscriptionList /> },
    { path: SUBSCRIPTION_ADD_PATH, element: <SubscriptionCreate /> },
    { path: SUBSCRIPTION_EDIT_PATH, element: <SubscriptionEdit /> },

    { path: INVENTORY_ITEM_LIST_PATH, element: <InventoryItemList /> },
    { path: INVENTORY_ITEM_ADD_PATH, element: <InventoryItemCreate /> },
    { path: INVENTORY_ITEM_EDIT, element: <InventoryItemEdit /> },

    { path: INVENTORY_CATEGORY_LIST_PATH, element: <InventoryCategoryList /> },
    { path: INVENTORY_CATEGORY_ADD_PATH, element: <InventoryCategoryCreate /> },
    { path: INVENTORY_CATEGORY_EDIT, element: <InventoryCategoryEdit /> },

    { path: SUPPLIER_LIST_PATH, element: <SupplierList /> },
    { path: SUPPLIER_ADD_PATH, element: <SupplierCreate /> },
    { path: SUPPLIER_EDIT, element: <SupplierEdit /> },

    { path: CUSTOMER_LIST_PATH, element: <CustomerList /> },
    { path: CUSTOMER_ADD_PATH, element: <CustomerCreate /> },
    { path: CUSTOMER_EDIT, element: <CustomerEdit /> },

    { path: CURRENCY_LIST_PATH, element: <CurrencyList /> },
    { path: CURRENCY_ADD_PATH, element: <CurrencyCreate /> },
    { path: CURRENCY_EDIT, element: <CurrencyEdit /> },

    { path: PROFILE, element: <Profile /> },

    // Phase 1 — Restaurant
    { path: "/restaurant/list", element: <RestaurantList /> },
    { path: "/restaurant/create", element: <RestaurantCreate /> },
    { path: "/restaurant/edit/:id", element: <RestaurantEdit /> },
    { path: "/restaurant/view/:id", element: <RestaurantView /> },

    // Phase 1 — Branch
    { path: "/branch/list", element: <BranchList /> },
    { path: "/branch/create", element: <BranchCreate /> },
    { path: "/branch/edit/:id", element: <BranchEdit /> },
    { path: "/branch/view/:id", element: <BranchView /> },

    // Phase 1 — Menu Categories
    { path: "/menu/categories", element: <MenuCategoryList /> },
    { path: "/menu/category/create", element: <MenuCategoryCreate /> },
    { path: "/menu/category/edit/:id", element: <MenuCategoryEdit /> },

    // Phase 1 — Menu Items
    { path: "/menu/items", element: <MenuItemList /> },
    { path: "/menu/item/create", element: <MenuItemCreate /> },
    { path: "/menu/item/edit/:id", element: <MenuItemEdit /> },

    // Phase 1 — Modifier Groups
    { path: "/menu/modifier-groups", element: <ModifierGroupList /> },
    { path: "/menu/modifier-group/create", element: <ModifierGroupCreate /> },
    { path: "/menu/modifier-group/edit/:id", element: <ModifierGroupEdit /> },

    // Phase 1 — Floors
    { path: "/table-management/floors", element: <FloorList /> },
    { path: "/table-management/floor/create", element: <FloorCreate /> },
    { path: "/table-management/floor/edit/:id", element: <FloorEdit /> },

    // Phase 1 — Tables
    { path: "/table-management/tables", element: <TableList /> },
    { path: "/table-management/table/create", element: <TableCreate /> },
    { path: "/table-management/table/edit/:id", element: <TableEdit /> },

    // Phase 1 — Reservations
    { path: "/table-management/reservations", element: <ReservationList /> },
    { path: "/table-management/reservation/create", element: <ReservationCreate /> },
    { path: "/table-management/reservation/edit/:id", element: <ReservationEdit /> },

    // Phase 2 — POS
    { path: "/pos/terminal", element: <POSScreen /> },
    { path: "/pos/sales", element: <POSSalesList /> },
    { path: "/pos/sales/view/:id", element: <POSSalesView /> },
    { path: "/pos/settings", element: <PosSettings /> },
    { path: "/pos/coupons", element: <CouponManagement /> },
];
