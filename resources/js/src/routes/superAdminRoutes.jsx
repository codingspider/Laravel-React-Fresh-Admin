import ProtectedRoute from "../ProtectedRoute";
import Dashboard from "../components/superadmin/Dashboard";
import MasterSetting from "../components/superadmin/MasterSetting";
import SaveOrder from "../components/order/SaveOrder";
import UserList from "../components/user/UserList";
import UserCreate from "../components/user/UserCreate";

import PlanList from "../components/superadmin/plan/PlanList";
import PlanCreate from "../components/superadmin/plan/PlanCreate";
import PlanEdit from "../components/superadmin/plan/PlanEdit";

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
import RoleCreat from "../components/superadmin/permission/Create";
import RoleEdit from "../components/superadmin/permission/Edit";
import Profile from './../components/user/Profile';

export const DASHBOARD_PATH = `/dashboard`;

export const USER_LIST_PATH = "/user/list";
export const USER_ADD_PATH = "/user/create";
export const USER_EDIT = "/user/edit/:id";

export const PLAN_LIST_PATH = "/plan/list";
export const PLAN_ADD_PATH = "/plan/create";
export const PLAN_EDIT_PATH = "/plan/edit/:id";

export const BUSINESS_LIST_PATH = "/business/list";
export const BUSINESS_ADD_PATH = "/business/create";
export const BUSINESS_EDIT_PATH = "/business/edit/:id";

export const CATEGORY_LIST_PATH = "/category/list";
export const CATEGORY_ADD_PATH = "/category/create";
export const CATEGORY_EDIT_PATH = "/category/edit/:id";

export const UNIT_LIST_PATH = "/unit/list";
export const UNIT_ADD_PATH = "/unit/create";
export const UNIT_EDIT_PATH = "/unit/edit/:id";

export const ROLE_LIST_PATH = "/role/list";
export const ROLE_ADD_PATH = "/role/create";
export const ROLE_EDIT_PATH = "/role/edit/:id";

export const PROFILE = "/profile";

export const superAdminRoutes = [
    { path: DASHBOARD_PATH, element: <Dashboard /> },
    { path: `/settings`, element: <MasterSetting /> },
    { path: `/save/order`, element: <SaveOrder /> },

    { path: USER_LIST_PATH, element: <UserList /> },
    { path: USER_ADD_PATH, element: <UserCreate /> },

    { path: PLAN_LIST_PATH, element: <PlanList /> },
    { path: PLAN_ADD_PATH, element: <PlanCreate /> },
    { path: PLAN_EDIT_PATH, element: <PlanEdit /> },

    { path: BUSINESS_LIST_PATH, element: <BusinessList /> },
    { path: BUSINESS_ADD_PATH, element: <BusinessCreate /> },
    { path: BUSINESS_EDIT_PATH, element: <BusinessEdit /> },

    { path: CATEGORY_LIST_PATH, element: <CategoryList /> },
    { path: CATEGORY_ADD_PATH, element: <CategoryCreate /> },
    { path: CATEGORY_EDIT_PATH, element: <CategoryEdit /> },

    { path: UNIT_LIST_PATH, element: <UnitList /> },
    { path: UNIT_ADD_PATH, element: <UnitCreate /> },
    { path: UNIT_EDIT_PATH, element: <UnitEdit /> },

    { path: ROLE_LIST_PATH, element: <RoleList /> },
    { path: ROLE_ADD_PATH, element: <RoleCreat /> },
    { path: ROLE_EDIT_PATH, element: <RoleEdit /> },
    
    { path: PROFILE, element: <Profile /> },


];