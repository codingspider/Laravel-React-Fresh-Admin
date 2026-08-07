import ProtectedRoute from "../ProtectedRoute";
import Dashboard from "../components/superadmin/Dashboard";
import SuperAdminDashboard from "../components/superadmin/SuperAdminDashboard";
import WebsiteSettings from "../components/superadmin/WebsiteSettings";
import FaqList from "../components/superadmin/FaqList";
import FaqForm from "../components/superadmin/FaqForm";
import SaveOrder from "../components/order/SaveOrder";

import DepartmentList from "../components/admin/hrm/DepartmentList";
import DepartmentCreate from "../components/admin/hrm/DepartmentCreate";
import DepartmentEdit from "../components/admin/hrm/DepartmentEdit";
import DesignationList from "../components/admin/hrm/DesignationList";
import DesignationCreate from "../components/admin/hrm/DesignationCreate";
import DesignationEdit from "../components/admin/hrm/DesignationEdit";
import EmployeeList from "../components/admin/hrm/EmployeeList";
import EmployeeCreate from "../components/admin/hrm/EmployeeCreate";
import EmployeeEdit from "../components/admin/hrm/EmployeeEdit";
import EmployeeView from "../components/admin/hrm/EmployeeView";
import AttendanceList from "../components/admin/hrm/AttendanceList";
import AttendanceCreate from "../components/admin/hrm/AttendanceCreate";
import AttendanceEdit from "../components/admin/hrm/AttendanceEdit";
import LeaveList from "../components/admin/hrm/LeaveList";
import LeaveCreate from "../components/admin/hrm/LeaveCreate";
import LeaveEdit from "../components/admin/hrm/LeaveEdit";
import HolidayList from "../components/admin/hrm/HolidayList";
import HolidayCreate from "../components/admin/hrm/HolidayCreate";
import HolidayEdit from "../components/admin/hrm/HolidayEdit";
import PayrollList from "../components/admin/hrm/PayrollList";
import PayrollCreate from "../components/admin/hrm/PayrollCreate";
import PayrollEdit from "../components/admin/hrm/PayrollEdit";
import PayrollView from "../components/admin/hrm/PayrollView";
import AccountList from "../components/admin/accounting/AccountList";
import AccountCreate from "../components/admin/accounting/AccountCreate";
import AccountEdit from "../components/admin/accounting/AccountEdit";
import IncomeList from "../components/admin/accounting/IncomeList";
import IncomeCreate from "../components/admin/accounting/IncomeCreate";
import IncomeEdit from "../components/admin/accounting/IncomeEdit";
import CashBankList from "../components/admin/accounting/CashBankList";
import CashBankCreate from "../components/admin/accounting/CashBankCreate";
import CashBankEdit from "../components/admin/accounting/CashBankEdit";
import ExpenseCategoryList from "../components/admin/accounting/ExpenseCategoryList";
import ExpenseCategoryCreate from "../components/admin/accounting/ExpenseCategoryCreate";
import ExpenseCategoryEdit from "../components/admin/accounting/ExpenseCategoryEdit";
import ExpenseList from "../components/admin/accounting/ExpenseList";
import ExpenseCreate from "../components/admin/accounting/ExpenseCreate";
import ExpenseEdit from "../components/admin/accounting/ExpenseEdit";
import JournalEntryList from "../components/admin/accounting/JournalEntryList";
import JournalEntryCreate from "../components/admin/accounting/JournalEntryCreate";
import JournalEntryEdit from "../components/admin/accounting/JournalEntryEdit";
import JournalEntryView from "../components/admin/accounting/JournalEntryView";
import LedgerList from "../components/admin/accounting/LedgerList";
import TrialBalance from "../components/admin/accounting/TrialBalance";
import ProfitLossReport from "../components/admin/accounting/ProfitLossReport";
import BalanceSheetReport from "../components/admin/accounting/BalanceSheetReport";
import CashFlowReport from "../components/admin/accounting/CashFlowReport";
import AccountingDashboard from "../components/admin/accounting/AccountingDashboard";

import SaleReport from "../components/admin/reports/SaleReport";
import PurchaseReport from "../components/admin/reports/PurchaseReport";
import TaxReport from "../components/admin/reports/TaxReport";
import ExpenseReport from "../components/admin/reports/ExpenseReport";

// Loyalty
import LoyaltySettings from "../components/admin/loyalty/LoyaltySettings";
import LoyaltyCustomers from "../components/admin/loyalty/LoyaltyCustomers";
import LoyaltyTransactions from "../components/admin/loyalty/LoyaltyTransactions";

import Notifications from "../components/admin/notifications/Notifications";

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
import SupplierView from "../components/admin/supplier/SupplierView";

// Inventory ERP — Recipes
import RecipeList from "../components/admin/recipe/RecipeList";
import RecipeCreate from "../components/admin/recipe/RecipeCreate";
import RecipeEdit from "../components/admin/recipe/RecipeEdit";
import RecipeCategoryList from "../components/admin/recipe/RecipeCategoryList";
import RecipeCategoryCreate from "../components/admin/recipe/RecipeCategoryCreate";
import RecipeCategoryEdit from "../components/admin/recipe/RecipeCategoryEdit";

// Inventory ERP — Purchases
import PurchaseList from "../components/admin/purchase/PurchaseList";
import PurchaseCreate from "../components/admin/purchase/PurchaseCreate";
import PurchaseEdit from "../components/admin/purchase/PurchaseEdit";
import PurchaseView from "../components/admin/purchase/PurchaseView";

// Inventory ERP — Stock Movements
import StockOverview from "../components/admin/inventory/StockOverview";
import StockTransactions from "../components/admin/inventory/StockTransactions";
import StockBatches from "../components/admin/inventory/StockBatches";
import StockTransfers from "../components/admin/inventory/StockTransfers";
import StockAdjustments from "../components/admin/inventory/StockAdjustments";
import StockWaste from "../components/admin/inventory/StockWaste";

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
import CouponList from "../components/admin/pos/CouponList";
import KitchenDisplay from "../components/kitchen/KitchenDisplay";
import CustomerDisplaySettings from "../components/customer/CustomerDisplaySettings";
import General from "../components/admin/general/General";


export const DASHBOARD_PATH = `/dashboard`;

export const FAQ_LIST_PATH = "/faq/list";
export const FAQ_CREATE_PATH = "/faq/create";
export const FAQ_EDIT_PATH = "/faq/edit/:id";

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
export const SUPPLIER_VIEW_PATH = (id) => `/inventory/supplier/view/${id}`;

// Inventory ERP — Recipes
export const RECIPE_LIST_PATH = "/inventory/recipes";
export const RECIPE_ADD_PATH = "/inventory/recipe/create";
export const RECIPE_EDIT = "/inventory/recipe/edit/:id";
export const RECIPE_EDIT_PATH = (id) => `/inventory/recipe/edit/${id}`;
export const RECIPE_CATEGORY_LIST_PATH = "/inventory/recipe-categories";
export const RECIPE_CATEGORY_ADD_PATH = "/inventory/recipe-category/create";
export const RECIPE_CATEGORY_EDIT = "/inventory/recipe-category/edit/:id";
export const RECIPE_CATEGORY_EDIT_PATH = (id) => `/inventory/recipe-category/edit/${id}`;

// Inventory ERP — Purchases
export const PURCHASE_LIST_PATH = "/inventory/purchases";
export const PURCHASE_ADD_PATH = "/inventory/purchase/create";
export const PURCHASE_EDIT = "/inventory/purchase/edit/:id";
export const PURCHASE_EDIT_PATH = (id) => `/inventory/purchase/edit/${id}`;
export const PURCHASE_VIEW_PATH = (id) => `/inventory/purchase/view/${id}`;

// Inventory ERP — Stock Movements
export const STOCK_OVERVIEW_PATH = "/inventory/stock/overview";
export const STOCK_TRANSACTIONS_PATH = "/inventory/stock/transactions";
export const STOCK_BATCHES_PATH = "/inventory/stock/batches";
export const STOCK_TRANSFERS_PATH = "/inventory/stock/transfers";
export const STOCK_ADJUSTMENTS_PATH = "/inventory/stock/adjustments";
export const STOCK_WASTE_PATH = "/inventory/stock/waste";

export const CUSTOMER_LIST_PATH = "/inventory/customers";
export const CUSTOMER_ADD_PATH = "/inventory/customer/create";
export const CUSTOMER_EDIT = "/inventory/customer/edit/:id";
export const CUSTOMER_EDIT_PATH = (id) => `/inventory/customer/edit/${id}`;

export const CURRENCY_LIST_PATH = "/currency/list";
export const CURRENCY_ADD_PATH = "/currency/create";
export const CURRENCY_EDIT = "/currency/edit/:id";
export const CURRENCY_EDIT_PATH = (id) => `/currency/edit/${id}`;

export const PROFILE = "/profile";

// HRM
export const HRM_DEPARTMENT_LIST_PATH = "/hrm/departments";
export const HRM_DEPARTMENT_CREATE_PATH = "/hrm/department/create";
export const HRM_DEPARTMENT_EDIT_PATH = (id) => `/hrm/department/edit/${id}`;
export const HRM_DESIGNATION_LIST_PATH = "/hrm/designations";
export const HRM_DESIGNATION_CREATE_PATH = "/hrm/designation/create";
export const HRM_DESIGNATION_EDIT_PATH = (id) => `/hrm/designation/edit/${id}`;
export const HRM_EMPLOYEE_LIST_PATH = "/hrm/employees";
export const HRM_EMPLOYEE_CREATE_PATH = "/hrm/employee/create";
export const HRM_EMPLOYEE_EDIT_PATH = (id) => `/hrm/employee/edit/${id}`;
export const HRM_EMPLOYEE_VIEW_PATH = (id) => `/hrm/employee/view/${id}`;
export const HRM_ATTENDANCE_LIST_PATH = "/hrm/attendance";
export const HRM_ATTENDANCE_CREATE_PATH = "/hrm/attendance/create";
export const HRM_ATTENDANCE_EDIT_PATH = (id) => `/hrm/attendance/edit/${id}`;
export const HRM_LEAVE_LIST_PATH = "/hrm/leaves";
export const HRM_LEAVE_CREATE_PATH = "/hrm/leave/create";
export const HRM_LEAVE_EDIT_PATH = (id) => `/hrm/leave/edit/${id}`;
export const HRM_HOLIDAY_LIST_PATH = "/hrm/holidays";
export const HRM_HOLIDAY_CREATE_PATH = "/hrm/holiday/create";

// HRM — Payroll
export const HRM_PAYROLL_LIST_PATH = "/hrm/payroll";
export const HRM_PAYROLL_CREATE_PATH = "/hrm/payroll/create";
export const HRM_PAYROLL_EDIT_PATH = (id) => `/hrm/payroll/edit/${id}`;
export const HRM_PAYROLL_VIEW_PATH = (id) => `/hrm/payroll/view/${id}`;

// Accounting - Chart of Accounts
export const ACCOUNTING_LIST_PATH = "/accounting/accounts";
export const ACCOUNTING_CREATE_PATH = "/accounting/accounts/create";
export const ACCOUNTING_EDIT_PATH = (id) => `/accounting/accounts/edit/${id}`;

// Accounting - Income
export const INCOME_LIST_PATH = "/accounting/income";
export const INCOME_CREATE_PATH = "/accounting/income/create";
export const INCOME_EDIT_PATH = (id) => `/accounting/income/edit/${id}`;

// Accounting - Expense
export const EXPENSE_CATEGORY_LIST_PATH = "/accounting/expense-categories";
export const EXPENSE_CATEGORY_CREATE_PATH = "/accounting/expense-categories/create";
export const EXPENSE_CATEGORY_EDIT_PATH = (id) => `/accounting/expense-categories/edit/${id}`;
export const EXPENSE_LIST_PATH = "/accounting/expenses";
export const EXPENSE_CREATE_PATH = "/accounting/expenses/create";
export const EXPENSE_EDIT_PATH = (id) => `/accounting/expenses/edit/${id}`;

// Accounting - Cash & Bank
export const CASH_BANK_LIST_PATH = "/accounting/cash-bank";
export const CASH_BANK_CREATE_PATH = "/accounting/cash-bank/create";
export const CASH_BANK_EDIT_PATH = (id) => `/accounting/cash-bank/edit/${id}`;

// Accounting - Journal Entries
export const JOURNAL_LIST_PATH = "/accounting/journal";
export const JOURNAL_CREATE_PATH = "/accounting/journal/create";
export const JOURNAL_EDIT_PATH = (id) => `/accounting/journal/edit/${id}`;
export const JOURNAL_VIEW_PATH = (id) => `/accounting/journal/view/${id}`;

// Accounting - Ledger
export const LEDGER_LIST_PATH = "/accounting/ledger";

// Accounting - Trial Balance
export const TRIAL_BALANCE_PATH = "/accounting/trial-balance";

// Accounting - Financial Reports
export const PROFIT_LOSS_PATH = "/accounting/reports/profit-loss";
export const BALANCE_SHEET_PATH = "/accounting/reports/balance-sheet";
export const CASH_FLOW_PATH = "/accounting/reports/cash-flow";
export const ACCOUNTING_DASHBOARD_PATH = "/accounting/dashboard";

// Business Reports
export const SALE_REPORT_PATH = "/reports/sales";
export const PURCHASE_REPORT_PATH = "/reports/purchases";
export const TAX_REPORT_PATH = "/reports/taxes";
export const EXPENSE_REPORT_PATH = "/reports/expenses";

// Loyalty
export const LOYALTY_SETTINGS_PATH = "/loyalty/settings";
export const LOYALTY_CUSTOMERS_PATH = "/loyalty/customers";
export const LOYALTY_TRANSACTIONS_PATH = "/loyalty/transactions";

export const NOTIFICATIONS_PATH = "/notifications";

export const superAdminRoutes = [
    { path: DASHBOARD_PATH, element: <SuperAdminDashboard /> },
    { path: `/settings`, element: <WebsiteSettings /> },
    { path: `/settings/general`, element: <General /> },
    { path: `/save/order`, element: <SaveOrder /> },

    { path: FAQ_LIST_PATH, element: <FaqList /> },
    { path: FAQ_CREATE_PATH, element: <FaqForm /> },
    { path: FAQ_EDIT_PATH, element: <FaqForm /> },

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
    { path: SUPPLIER_VIEW_PATH(":id"), element: <SupplierView /> },

    // Inventory ERP — Recipes
    { path: RECIPE_LIST_PATH, element: <RecipeList /> },
    { path: RECIPE_ADD_PATH, element: <RecipeCreate /> },
    { path: RECIPE_EDIT, element: <RecipeEdit /> },
    { path: RECIPE_CATEGORY_LIST_PATH, element: <RecipeCategoryList /> },
    { path: RECIPE_CATEGORY_ADD_PATH, element: <RecipeCategoryCreate /> },
    { path: RECIPE_CATEGORY_EDIT, element: <RecipeCategoryEdit /> },

    // Inventory ERP — Purchases
    { path: PURCHASE_LIST_PATH, element: <PurchaseList /> },
    { path: PURCHASE_ADD_PATH, element: <PurchaseCreate /> },
    { path: PURCHASE_EDIT, element: <PurchaseEdit /> },
    { path: PURCHASE_VIEW_PATH(":id"), element: <PurchaseView /> },

    // Inventory ERP — Stock Movements
    { path: STOCK_OVERVIEW_PATH, element: <StockOverview /> },
    { path: STOCK_TRANSACTIONS_PATH, element: <StockTransactions /> },
    { path: STOCK_BATCHES_PATH, element: <StockBatches /> },
    { path: STOCK_TRANSFERS_PATH, element: <StockTransfers /> },
    { path: STOCK_ADJUSTMENTS_PATH, element: <StockAdjustments /> },
    { path: STOCK_WASTE_PATH, element: <StockWaste /> },

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
    { path: "/pos/coupons", element: <CouponList /> },

    // Phase 2 — Kitchen Display System (KDS)
    { path: "/kitchen/display", element: <KitchenDisplay /> },

    // Phase 2 — Customer Display System (CDS)
    { path: "/customer-display/settings", element: <CustomerDisplaySettings /> },

    // HRM
    { path: HRM_DEPARTMENT_LIST_PATH, element: <DepartmentList /> },
    { path: HRM_DEPARTMENT_CREATE_PATH, element: <DepartmentCreate /> },
    { path: "/hrm/department/edit/:id", element: <DepartmentEdit /> },
    { path: HRM_DESIGNATION_LIST_PATH, element: <DesignationList /> },
    { path: HRM_DESIGNATION_CREATE_PATH, element: <DesignationCreate /> },
    { path: "/hrm/designation/edit/:id", element: <DesignationEdit /> },
    { path: HRM_EMPLOYEE_LIST_PATH, element: <EmployeeList /> },
    { path: HRM_EMPLOYEE_CREATE_PATH, element: <EmployeeCreate /> },
    { path: "/hrm/employee/edit/:id", element: <EmployeeEdit /> },
    { path: "/hrm/employee/view/:id", element: <EmployeeView /> },
    { path: HRM_ATTENDANCE_LIST_PATH, element: <AttendanceList /> },
    { path: HRM_ATTENDANCE_CREATE_PATH, element: <AttendanceCreate /> },
    { path: "/hrm/attendance/edit/:id", element: <AttendanceEdit /> },
    { path: HRM_LEAVE_LIST_PATH, element: <LeaveList /> },
    { path: HRM_LEAVE_CREATE_PATH, element: <LeaveCreate /> },
    { path: "/hrm/leave/edit/:id", element: <LeaveEdit /> },
    { path: HRM_HOLIDAY_LIST_PATH, element: <HolidayList /> },
    { path: "/hrm/holiday/create", element: <HolidayCreate /> },
    { path: "/hrm/holiday/edit/:id", element: <HolidayEdit /> },
    { path: HRM_PAYROLL_LIST_PATH, element: <PayrollList /> },
    { path: HRM_PAYROLL_CREATE_PATH, element: <PayrollCreate /> },
    { path: "/hrm/payroll/edit/:id", element: <PayrollEdit /> },
    { path: "/hrm/payroll/view/:id", element: <PayrollView /> },
    { path: ACCOUNTING_LIST_PATH, element: <AccountList /> },
    { path: ACCOUNTING_CREATE_PATH, element: <AccountCreate /> },
    { path: "/accounting/accounts/edit/:id", element: <AccountEdit /> },
    { path: INCOME_LIST_PATH, element: <IncomeList /> },
    { path: INCOME_CREATE_PATH, element: <IncomeCreate /> },
    { path: "/accounting/income/edit/:id", element: <IncomeEdit /> },
    { path: EXPENSE_CATEGORY_LIST_PATH, element: <ExpenseCategoryList /> },
    { path: EXPENSE_CATEGORY_CREATE_PATH, element: <ExpenseCategoryCreate /> },
    { path: "/accounting/expense-categories/edit/:id", element: <ExpenseCategoryEdit /> },
    { path: EXPENSE_LIST_PATH, element: <ExpenseList /> },
    { path: EXPENSE_CREATE_PATH, element: <ExpenseCreate /> },
    { path: "/accounting/expenses/edit/:id", element: <ExpenseEdit /> },
    { path: CASH_BANK_LIST_PATH, element: <CashBankList /> },
    { path: CASH_BANK_CREATE_PATH, element: <CashBankCreate /> },
    { path: "/accounting/cash-bank/edit/:id", element: <CashBankEdit /> },

    // Accounting - Journal Entries
    { path: JOURNAL_LIST_PATH, element: <JournalEntryList /> },
    { path: JOURNAL_VIEW_PATH(":id"), element: <JournalEntryView /> },
    { path: JOURNAL_CREATE_PATH, element: <JournalEntryCreate /> },
    { path: JOURNAL_EDIT_PATH(":id"), element: <JournalEntryEdit /> },

    // Accounting - Ledger
    { path: LEDGER_LIST_PATH, element: <LedgerList /> },

    // Accounting - Trial Balance
    { path: TRIAL_BALANCE_PATH, element: <TrialBalance /> },

    // Accounting - Financial Reports
    { path: PROFIT_LOSS_PATH, element: <ProfitLossReport /> },
    { path: BALANCE_SHEET_PATH, element: <BalanceSheetReport /> },
    { path: CASH_FLOW_PATH, element: <CashFlowReport /> },

    // Accounting - Dashboard
    { path: ACCOUNTING_DASHBOARD_PATH, element: <AccountingDashboard /> },

    // Business Reports
    { path: SALE_REPORT_PATH, element: <SaleReport /> },
    { path: PURCHASE_REPORT_PATH, element: <PurchaseReport /> },
    { path: TAX_REPORT_PATH, element: <TaxReport /> },
    { path: EXPENSE_REPORT_PATH, element: <ExpenseReport /> },

    // Loyalty
    { path: LOYALTY_SETTINGS_PATH, element: <LoyaltySettings /> },
    { path: LOYALTY_CUSTOMERS_PATH, element: <LoyaltyCustomers /> },
    { path: LOYALTY_TRANSACTIONS_PATH, element: <LoyaltyTransactions /> },

    // Notifications
    { path: NOTIFICATIONS_PATH, element: <Notifications /> },
];
