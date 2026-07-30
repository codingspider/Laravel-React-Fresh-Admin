# Restaurant SaaS ERP System

## Complete Product Requirements Document (PRD) and System Documentation

### Goal
Build a modern cloud-based Restaurant SaaS Platform competing with Toast POS, Square for Restaurants, Petpooja, GloriaFood, Oracle Simphony, and Foodics.

---

## Technology Stack

### Backend
- Laravel 12+
- PHP 8.4+
- MySQL 8
- Redis
- Laravel Horizon
- Laravel Queue
- Laravel Sanctum
- Laravel Passport (Optional)
- Spatie Permission
- Laravel Reverb/WebSocket
- Laravel Scheduler
- Laravel Notifications
- Stripe, Razorpay, PayPal
- Twilio, Firebase
- Meilisearch/ElasticSearch

### Frontend
- React 19
- Vite
- React Router
- React Query
- Chakra UI
- React Hook Form
- ApexCharts
- TanStack Table
- Socket.io Client
- React DnD

---

## SaaS Architecture

### Multi-Tenant
Each restaurant has isolated data. `restaurant_id` exists in every table.

### User Roles
- **Super Admin** - Manage restaurants, SaaS subscription, Plans, Payments, Global settings, Themes, Support, Analytics
- **Restaurant Owner** - Full access
- **Branch Manager** - Only branch data
- **Cashier** - POS only
- **Waiter** - Take orders, Table management
- **Kitchen Staff** - Kitchen Display System (KDS)
- **Chef** - Accept order, Cooking, Ready
- **Delivery Boy** - Assigned deliveries, Live status
- **Accountant** - Finance only
- **HR Manager** - Employees
- **Inventory Manager** - Stock

---

## SaaS Modules

### 1. Restaurant Management
- Restaurant profile, Logo, Multiple branches
- Tax, Currency, Timezone
- Working hours, Holidays, Theme

### 2. Subscription Module
- Plans: Free, Starter, Business, Enterprise
- Features: Monthly, Yearly, Trial, Coupons, Auto renewal, Usage limits

### 3. CRM
- Customer database: Name, Mobile, Email, Birthday, Anniversary, Favourite food, Address, Notes
- Customer Groups: VIP, Corporate, Regular
- Loyalty, Referral, Wallet, Reward Points
- Gift Cards, Coupons
- SMS, Email, Push Notification
- Customer Timeline

### 4. POS System
- Touch Screen, Category tabs, Product search, Barcode, QR Scan
- Customer selection, Discount, Coupon, Tax, Modifier, Notes, table, shipping
- Split Bill, Merge Bill, Hold Bill
- Partial Payment, Multiple Payment Methods
- Refund, Returns, Quick Checkout

### 5. Table Management
- Dining hall, Table, Reservation, Floor
- Merge tables, Transfer table, Waiting queue
- Table Status: Available, Reserved, Occupied, Billing, Cleaning

### 6. Kitchen Order Ticket (KOT)
- Generate KOT, Kitchen receives instantly
- Status: Pending, Preparing, Ready, Served, Cancelled
- Kitchen Printer, Kitchen Display, Priority, Cooking Timer, Recipe Notes

### 7. Kitchen Display System (KDS)
- Real-time dashboard, Live Orders, Order Timer
- Delayed Orders, Ready Notification, Chef Assignment, Priority Queue

### 8. Customer Display System (CDS)
- Secondary Monitor: Ordered items, Quantity, Discount, Tax, Grand Total, Promotions, QR Payment

### 9. QR Ordering
- Customer scans QR, Menu opens, Order online, Pay, Call waiter, Feedback

### 10. Online Ordering
- Website, PWA, Mobile
- Pickup, Delivery, Dine-in

### 11. Delivery Management
- Delivery Partners, Internal Riders
- Tracking, OTP, Route, Distance, Status

### 12. Inventory ERP
- Stock, Warehouse, Branches
- Raw Materials, Finished Products, Recipes
- Stock Transfer, Waste, Expiry, Stock Adjustment
- Purchase, Suppliers, GRN, Consumption
- Stock Valuation, Batch, Serial

### 13. Recipe Management
- Recipe, Ingredients, Quantity, Unit, Cost
- Preparation, Cooking Time, Nutritional Info
- Automatic stock deduction

### 14. Purchase Management
- Purchase Order, Supplier, Quotation
- Goods Receive Note, Purchase Return
- Debit Note, Payments

### 15. Supplier CRM
- Suppliers, Contacts, Payments, History, Outstanding, Documents

### 16. Finance ERP
- Income, Expense, Ledger, Journal, Cashbook, Bank
- Tax, VAT, Profit & Loss, Balance Sheet, Cash Flow
- Budget, Assets, Liabilities

### 17. HRM
- Employees, Departments, Designation
- Attendance, Leave, Holiday
- Payroll, Salary, Advance, Loan, Bonus, Increment
- Performance, Termination, Documents, ID Cards

### 18. Payroll
- Generate Salary, Payslip, PF, Tax
- Loan deduction, Bonus, Allowance, Overtime

### 19. Shift Management
- Morning, Evening, Night
- Open Shift, Close Shift
- Cash Drawer, Cash Count

### 20. Reports
- Sales, Daily/Monthly/Yearly, Waiter/Cashier/Branch Sales
- Kitchen Performance, Food Cost, Profit, Expenses
- Inventory, Stock, Customer, Supplier, Tax
- Delivery, Loyalty, Payroll, Attendance
- Waste Analysis, Best Selling Items, Slow Moving Items, Peak Hours

### 21. Marketing
- Coupons, Promo, Birthday Wishes
- WhatsApp, SMS, Email, Push Notification
- Referral, Campaign

### 22. Reviews
- Google Review, Feedback, Complaint, Rating

### 23. Accounting
- Double Entry, Chart of Accounts, General Ledger
- Trial Balance, Journal Entries, Bank Reconciliation

### 24. Invoice
- Thermal, A4, PDF, Email, Print
- QR Code, Barcode, Custom Logo, Tax, VAT, Signature

### 25. Printing
- Kitchen Printer, Receipt Printer, Invoice Printer, Label Printer
- Network Printer, USB Printer, Bluetooth Printer

### 26. Hardware Support
- Barcode Scanner, QR Scanner, Cash Drawer
- Receipt Printer, Kitchen Printer, Customer Display
- Card Machine, NFC

### 27. Reservation
- Book Table, Calendar, Deposit, Guest Count, Reminder, Cancellation

### 28. Menu Management
- Categories, Subcategories, Menu Items, Combos
- Modifiers, Add-ons, Sizes, Variants, Toppings
- Availability, Happy Hour

### 29. Loyalty
- Reward Points, Wallet, Gift Card, Membership, VIP

### 30. Multi Branch
- Branch Transfer, Branch Reports, Branch Stock
- Branch Employees, Branch Settings

### 31. Multi Language
- English, Arabic, French, Spanish, Hindi, Bengali

### 32. Multi Currency
- Support multiple currencies

### 33. Notification
- Email, SMS, Push, WhatsApp, Slack

### 34. AI Features
- Sales Forecasting, Demand Prediction, Inventory Forecast
- Menu Recommendation, Customer Segmentation
- AI Reports, Voice Order

### 35. Analytics Dashboard
- Revenue, Profit, Orders, Top Items, Peak Time
- Food Cost %, Labour Cost %, Inventory Value
- Customer Growth, Subscription Revenue (SaaS)

---

## Database Modules

### Core Tables
- restaurants, branches, users, roles, permissions
- customers, customer_groups
- tables, floors, reservations
- menu_categories, menu_items, menu_variants
- modifiers, modifier_groups
- orders, order_items
- kots, kitchen_stations
- inventory_items, recipes, recipe_items
- suppliers, purchases, purchase_items
- stock_movements, stock_adjustments
- employees, attendance, payrolls
- invoices, payments, expenses
- ledgers, loyalty_transactions
- gift_cards, coupons
- subscriptions, plans
- tenant_settings, notifications, audit_logs

---

## API Modules
- Authentication
- Restaurant Management
- Branch Management
- POS
- Orders
- KOT
- Kitchen Display
- Customer Display
- QR Ordering
- Inventory
- Purchasing
- CRM
- HRM
- Payroll
- Finance
- Reports
- Notifications
- Subscription
- Super Admin

---

## Module Priority (Implementation Order)

### Phase 1 - Core
1. Restaurant Module
2. Branch Module
3. Auth/Users Module

### Phase 2 - Menu & POS
4. Menu Management
5. POS System
6. Table Management

### Phase 3 - Orders & Kitchen
7. Orders Module
8. KOT Module
9. Kitchen Display (KDS)

### Phase 4 - Customers & CRM
10. Customer Module
11. CRM Module
12. Loyalty Module

### Phase 5 - Inventory & Purchasing
13. Inventory Module
14. Purchase Module
15. Supplier Module
16. Recipe Module

### Phase 6 - Finance & Accounting
17. Finance Module
18. Accounting Module
19. Invoice Module

### Phase 7 - HRM & Payroll
20. Employee Module
21. HRM Module
22. Payroll Module
23. Shift Module

### Phase 8 - SaaS & Subscription
24. Subscription Module
25. Plan Module
26. Super Admin

### Phase 9 - Reports & Analytics
27. Reports Module
28. Analytics Module

### Phase 10 - Marketing & Notifications
29. Marketing Module
30. Notification Module
31. Review Module

---

## Development Rules & Conventions

**IMPORTANT:** Always read `requirements.md` before starting any task. Follow all rules and conventions defined here.

### Language / Translation Keys
- All frontend translation keys (used via `t('key')` in React) **must** be defined in `lang/en/message.php`.
- When adding a new `t('key')` call in any JSX/JS file, always add the corresponding key-value pair to `lang/en/message.php`.
- Never leave missing translation keys — always verify the key exists in `message.php` before using it in the frontend.
- Backend module-specific translation keys go in their respective `Modules/{Module}/lang/en/module.php` files.

---

## Frontend Design Guidelines (Light & Dark Mode)

### Design Standard

The **Admin Branch Create/Edit pages** are the official design reference for all **form** pages. The **RestaurantList** page is the official design reference for all **list/table** pages. All existing and future pages must follow these exact patterns. No deviations are permitted.

### Color Rules

1. **All colors must be referenced exclusively from `theme.js`.** Never hardcode color values such as `gray.50`, `gray.800`, `white`, `black`, or any hex code in components.
2. Every component—tables, forms, cards, inputs, buttons, modals, borders, text, hover states, focus states, shadows, and backgrounds—must use the centralized theme configuration via the `useThemeColors` hook.
3. The `useThemeColors` hook reads from `theme.js` semantic tokens and resolves the correct value for the current color mode (`default` for light, `_dark` for dark).
4. Do not introduce new colors, new color tokens, or new shade values outside of `theme.js`.
5. Do not use Chakra's built-in color scale directly (e.g., `color="gray.500"`, `bg="white"`) in any component. Always use theme tokens instead.

### Page Layout Pattern

Every page must follow this structure:

```jsx
<Box py={3}>
    <Box mx="auto">
        {/* Breadcrumb Card */}
        <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
            <CardBody py={3}>
                <Breadcrumb>...</Breadcrumb>
            </CardBody>
        </Card>

        {/* Form / Content Card */}
        <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
            <CardHeader
                bg={colors.bgCard}
                borderBottom="1px solid"
                borderColor={colors.borderSubtle}
                pb={6}
            >
                {/* Title + List Button */}
            </CardHeader>
            <CardBody p={8}>
                {/* Form or Content */}
            </CardBody>
        </Card>
    </Box>
</Box>
```

- Do **not** set `bg={colors.bgSubtle}` or `minH="100vh"` on the outer `<Box>`. The `MainLayout` already provides the page background via `bg={colors.bgPage}`.

### Input Styling Pattern

All form inputs (Input, Textarea, Select) must use this consistent pattern:

```jsx
bg={colors.bgInput}
border="1px solid"
borderColor={colors.borderInput}
borderRadius="md"
focusBorderColor="teal.500"
_hover={{ borderColor: "gray.300" }}
size="md"
transition="all 0.2s"
```

### Button Styling Pattern

**Save / Primary Button:**
```jsx
<Button
    type="submit"
    colorScheme="teal"
    bg="teal.500"
    color="white"
    fontWeight="semibold"
    px={8}
    h={12}
    borderRadius="md"
    _hover={{ bg: "teal.600" }}
    _active={{ bg: "teal.700" }}
    boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)"
/>
```

**Cancel / Secondary Button:**
```jsx
<Button
    type="button"
    colorScheme="gray"
    variant="outline"
    fontWeight="semibold"
    px={6}
    h={12}
    borderRadius="md"
    _hover={{ bg: "gray.50" }}
/>
```

### Form Label Pattern

```jsx
<FormLabel
    fontSize="sm"
    fontWeight="semibold"
    color={colors.textPrimary}
    mb={2}
/>
```

### Theme Token Usage Reference

| Element | Light Mode Token | Dark Mode Token | Theme Key |
|---|---|---|---|
| Page background | `gray.50` | `gray.900` | `colors.bgPage` |
| Card background | `white` | `gray.800` | `colors.bgCard` |
| Input background | `gray.100` | `gray.700` | `colors.bgInput` |
| Primary text | `gray.800` | `white` | `colors.textPrimary` |
| Secondary text | `gray.500` | `gray.400` | `colors.textSecondary` |
| Input border | `gray.200` | `gray.600` | `colors.borderInput` |
| Card border | `gray.100` | `gray.700` | `colors.borderSubtle` |
| Default border | `gray.200` | `gray.700` | `colors.borderDefault` |

### Mandatory Rule

This design guideline is a **permanent project requirement**. It applies to all existing pages (retroactively) and all future pages. Every new component must be built following this standard. No exceptions.

---

## Table & List Page Design Guidelines

### Design Standard

The **RestaurantList** page (`restaurant/RestaurantList.jsx`) is the official design reference for all list/table pages. Every existing and future list page must match this exact pattern. No deviations are permitted.

### Reference Files

- `RestaurantList.jsx` — List page structure, data fetching, columns, actions, inline filters
- `TanStackTable.jsx` — Shared table component (search, pagination, table rendering, children slot for inline filters)
- `PageHeader.jsx` — Page header with breadcrumbs, title, subtitle, action buttons
- `TableExportButtons.jsx` — Print and Download CSV buttons (reusable)

### Table Structure Pattern

Every list page must follow this structure:

```jsx
<Box>
    <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        breadcrumbs={[
            { label: t("dashboard"), path: DASHBOARD_PATH },
            { label: t("list"), isCurrent: true },
        ]}
        action={ADD_PATH}
        actionLabel={t("add_item")}
    >
        <TableExportButtons data={data} columns={columns} filename="export_name" />
    </PageHeader>

    <Box
        bg={colors.bgCard}
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        boxShadow="card"
        border="1px solid"
        borderColor={colors.borderDefault}
    >
        <TanStackTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            pageIndex={pageIndex}
            pageSize={pageSize}
            setPageIndex={setPageIndex}
            pageCount={pageCount}
            isLoading={isLoading}
            addURL={ADD_PATH}
            totalItems={totalItems}
        >
            {/* Inline filters — rendered on same line as search input */}
            <Select
                maxW="160px"
                size="md"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                placeholder={t("all_status")}
                borderRadius="lg"
            >
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
            </Select>
        </TanStackTable>
    </Box>
</Box>
```

### Toolbar Layout (Search + Filters + Actions)

The search box and all filter controls must be **inline on a single row** (side by side). `TanStackTable` supports a `children` prop that renders filter controls directly between the search input and the action buttons — use this for inline dropdowns.

```
┌──────────────────────────────────────────────────────────────┐
│ [Search Box] [Filter Dropdowns (children)] [Print] [CSV]     │
└──────────────────────────────────────────────────────────────┘
```

- Search input: `maxW={{ base: "100%", md: "280px" }}`, `size="md"`, `borderRadius="lg"`
- Filter dropdowns: passed as `children` to `TanStackTable`, rendered inline with search
- Action buttons: Print and Download CSV via `TableExportButtons` (passed as `children` to `PageHeader`)
- On mobile, controls stack vertically with `gap={3}`

### Action Buttons (Header Area)

Use the reusable `TableExportButtons` component (passed as `children` to `PageHeader`). It provides Print and Download CSV buttons with consistent styling.

```jsx
import TableExportButtons from "../ui/TableExportButtons";

<PageHeader ... >
    <TableExportButtons data={data} columns={columns} filename="export_name" />
</PageHeader>
```

- **Print Button** — Opens same-page overlay with table-only content, triggers browser print
- **Download CSV Button** — Exports current table data as CSV file
- Both accept `data` (array), `columns` (column definitions), and `filename` (string) props

### Table Styling

| Element | Styling |
|---|---|
| **Table wrapper** | `borderRadius="lg"`, `border="1px solid"`, `borderColor={colors.borderDefault}`, `overflowX="auto"` |
| **Table header row** | `bg={colors.bgSubtle}` |
| **Table header cell** | `fontSize="xs"`, `fontWeight="600"`, `color="gray.500"`, `py={3}`, `whiteSpace="nowrap"`, `borderColor={colors.borderDefault}` |
| **Table body row** | `_hover={{ bg: colors.bgHover }}`, `transition="background 0.15s ease"`, `borderColor={colors.borderDefault}` |
| **Table body cell** | `fontSize="sm"`, `py={3}`, `borderColor={colors.borderDefault}` |
| **Table size** | `size="sm"` on `<Table>` |

### Column Cell Patterns

**Row number column:**
```jsx
<Text fontSize="sm" fontWeight="500" color="gray.500">
    {row.index + 1}
</Text>
```

**Text column:**
```jsx
<Text fontSize="sm" fontWeight="600">
    {getValue()}
</Text>
```

**Price/currency column:**
```jsx
<Text fontSize="sm" fontWeight="600" color="green.600">
    {getValue()}
</Text>
```

**Status badge column:**
```jsx
<Badge
    colorScheme={isActive ? "green" : "gray"}
    variant="subtle"
    borderRadius="full"
    px={2.5}
    py={0.5}
    fontSize="xs"
    fontWeight="600"
>
    {getValue()}
</Badge>
```

**Category/tag badge column:**
```jsx
<Badge
    colorScheme="blue"
    variant="subtle"
    borderRadius="full"
    px={2.5}
    py={0.5}
    fontSize="xs"
    textTransform="capitalize"
>
    {getValue()}
</Badge>
```

**Multi-value badge column (e.g., packages, tags):**
```jsx
<HStack spacing={1} flexWrap="wrap">
    {items.slice(0, 2).map((item, i) => (
        <Badge key={i} colorScheme="purple" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
            {item.name}
        </Badge>
    ))}
    {items.length > 2 && (
        <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
            +{items.length - 2}
        </Badge>
    )}
</HStack>
```

**Empty/null value:**
```jsx
<Text fontSize="sm" color="gray.400">-</Text>
```

### Actions Column (Row Menu)

Use a `Menu` dropdown for row actions (view, edit, delete):

```jsx
<Menu>
    <MenuButton
        as={IconButton}
        icon={<Icon as={MoreHorizontal} boxSize={4} />}
        variant="ghost"
        size="sm"
        borderRadius="lg"
        aria-label={t("actions")}
    />
    <MenuList minW="140px" p={1.5}>
        <MenuItem
            icon={<Icon as={ViewIcon} boxSize={4} />}
            borderRadius="md"
            fontSize="sm"
            onClick={() => navigate(viewPath)}
        >
            {t("view")}
        </MenuItem>
        <MenuItem
            icon={<Icon as={EditIcon} boxSize={4} />}
            borderRadius="md"
            fontSize="sm"
            onClick={() => navigate(editPath)}
        >
            {t("edit")}
        </MenuItem>
        <MenuItem
            icon={<Icon as={DeleteIcon} boxSize={4} />}
            borderRadius="md"
            fontSize="sm"
            color="red.500"
            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
            onClick={() => handleDelete(id)}
        >
            {t("delete")}
        </MenuItem>
    </MenuList>
</Menu>
```

### Pagination Pattern

Pagination is handled by `TanStackTable`. The pattern:

- Left side: `Page X of Y` text (`fontSize="sm"`, `color="gray.500"`)
- Right side: Navigation buttons (First, Previous, Page numbers, Next, Last)
- Active page button: `variant="primary"`, `minW="36px"`, `borderRadius="lg"`
- Inactive page button: `variant="ghost"`
- Separator: `borderTop="1px solid"`, `borderColor={colors.borderDefault}`, `mt={4}`, `pt={4}`

### Search Input Styling

```jsx
<InputGroup maxW={{ base: "100%", md: "280px" }} size="md">
    <InputLeftElement pointerEvents="none">
        <Icon as={Search} color="gray.400" boxSize={4} />
    </InputLeftElement>
    <Input
        placeholder={searchPlaceholder}
        value={globalFilter ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        borderRadius="lg"
        bg={colors.bgSubtle}
        _placeholder={{ color: "gray.400" }}
    />
</InputGroup>
```

### Data Fetching Pattern

Every list page must implement server-side pagination:

```jsx
const fetchData = useCallback(async () => {
    try {
        setIsLoading(true);
        const res = await api.get(ENDPOINT, {
            params: {
                page: pageIndex + 1,
                per_page: pageSize,
                search: globalFilter || "",
            },
        });
        const items = res.data?.data?.data || res.data?.data || [];
        const total = res.data?.meta?.total || res.data?.data?.total || items.length;
        setData(items);
        setPageCount(Math.ceil(total / pageSize));
        setTotalItems(total);
    } catch (err) {
        console.error("fetchData error:", err);
    } finally {
        setIsLoading(false);
    }
}, [pageIndex, globalFilter, pageSize]);
```

### Delete Confirmation Pattern

Use SweetAlert2 for delete confirmation:

```jsx
const result = await Swal.fire({
    title: t("delete_item"),
    text: t("action_cannot_be_undone"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0d9488",
    cancelButtonColor: "#6b7280",
    confirmButtonText: t("yes_delete_it"),
    cancelButtonText: t("cancel"),
    reverseButtons: true,
    customClass: { popup: "swal-popup" },
});
```

### Mandatory Rules

1. **All list pages must use `TanStackTable`** — do not build custom tables.
2. **All list pages must use `PageHeader`** — for consistent breadcrumbs and titles.
3. **Inline filters** — pass filter dropdowns as `children` to `TanStackTable` so they render on the same line as search.
4. **Action buttons** — use `TableExportButtons` (Print + Download CSV) passed as `children` to `PageHeader`.
5. **No hardcoded colors** — all table styling must use `useThemeColors` tokens.
6. **Consistent row hover** — `_hover={{ bg: colors.bgHover }}` on all body rows.
7. **Consistent cell padding** — `py={3}` on all header and body cells.
8. **This design is permanent** — applies to all existing and future list pages. No exceptions.
