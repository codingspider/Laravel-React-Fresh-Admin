# Comprehensive Testing Checklist

**Project:** Restaurant Management System (SaaS)
**Stack:** Laravel 12 + React 19 + Chakra UI + MySQL
**Last Updated:** 2026-08-15

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Multi-Tenancy & Data Isolation](#2-multi-tenancy--data-isolation)
3. [Role & Permission System](#3-role--permission-system)
4. [Restaurant & Branch Management](#4-restaurant--branch-management)
5. [Menu Management](#5-menu-management)
6. [Table & Floor Management](#6-table--floor-management)
7. [Reservation System](#7-reservation-system)
8. [Point of Sale (POS)](#8-point-of-sale-pos)
9. [Kitchen Display System (KDS)](#9-kitchen-display-system-kds)
10. [Customer Display System (CDS)](#10-customer-display-system-cds)
11. [Guest Ordering (QR)](#11-guest-ordering-qr)
12. [Order Management](#12-order-management)
13. [Customer & CRM](#13-customer--crm)
14. [Loyalty Programme](#14-loyalty-programme)
15. [Inventory Management](#15-inventory-management)
16. [Purchasing & GRN](#16-purchasing--grn)
17. [Supplier Management](#17-supplier-management)
18. [Recipe Management](#18-recipe-management)
19. [Accounting & Finance](#19-accounting--finance)
20. [HRM & Payroll](#20-hrm--payroll)
21. [Reports & Analytics](#21-reports--analytics)
22. [Notifications](#22-notifications)
23. [Subscription & SaaS](#23-subscription--saas)
24. [Super Admin Panel](#24-super-admin-panel)
25. [Installer](#25-installer)
26. [Frontend / UI](#26-frontend--ui)
27. [API Standards](#27-api-standards)
28. [Security](#28-security)
29. [Performance](#29-performance)
30. [Offline / PWA](#30-offline--pwa)
31. [Database & Data Integrity](#31-database--data-integrity)
32. [Internationalization (i18n)](#32-internationalization-i18n)
33. [Cross-Browser & Responsive](#33-cross-browser--responsive)
34. [Deployment & Environment](#34-deployment--environment)

---

## 1. Authentication & Authorization

### Registration
- [ ] Register with valid data succeeds
- [ ] Duplicate email rejected with proper error message
- [ ] Weak password rejected (min length, complexity)
- [ ] Password confirmation mismatch rejected
- [ ] CSRF token validated on submission
- [ ] Rate limiting applied (brute-force prevention)
- [ ] Registered user receives proper role/permissions
- [ ] Redirect to dashboard after successful registration

### Login
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid email fails gracefully
- [ ] Login with invalid password fails gracefully
- [ ] Account lockout after max failed attempts
- [ ] `access_token` cookie is set with correct flags (HttpOnly, Secure, SameSite)
- [ ] Remember Me functionality works
- [ ] Redirect to last intended URL after login
- [ ] Rate limiting on login endpoint
- [ ] Login audit trail logged

### Logout
- [ ] Logout destroys session
- [ ] `access_token` cookie cleared
- [ ] Cannot access protected routes after logout
- [ ] Back button cannot access cached protected pages

### Password Reset
- [ ] Forgot password sends email with valid token
- [ ] Token expires after defined period
- [ ] Reset with valid token succeeds
- [ ] Reset with expired/invalid token fails
- [ ] Password updated requires re-login on other sessions
- [ ] Rate limiting on forgot-password endpoint

### Profile Management
- [ ] Update profile name/email succeeds
- [ ] Email change requires verification
- [ ] Change password requires current password
- [ ] Profile image upload works (valid types, max size)
- [ ] Profile image URL is not exposed to other tenants

---

## 2. Multi-Tenancy & Data Isolation

- [ ] `restaurant.scope` middleware correctly resolves `restaurant_id` and `branch_id`
- [ ] Restaurant A cannot see Restaurant B's data (menu, orders, customers, etc.)
- [ ] Branch-level isolation: Branch A cannot see Branch B's data (where applicable)
- [ ] API queries are always scoped to authenticated user's restaurant
- [ ] Bulk operations respect tenant scoping
- [ ] Search/filter endpoints do not leak cross-tenant data
- [ ] Export endpoints only export scoped data
- [ ] File uploads (images, backups) stored per-tenant paths
- [ ] Activity logs are scoped to restaurant
- [ ] Notifications are scoped to restaurant

---

## 3. Role & Permission System

### Super Admin
- [ ] Has ALL permissions automatically
- [ ] Can access all modules regardless of subscription
- [ ] Can manage restaurants, plans, packages, subscriptions
- [ ] Can view platform-level reports and stats

### Restaurant Owner
- [ ] Has full access to own restaurant data
- [ ] Cannot access other restaurants' data
- [ ] Can manage branches, employees, settings

### Custom Roles
- [ ] Creating a new role succeeds
- [ ] Assigning permissions to role works
- [ ] User with role inherits correct permissions
- [ ] Role deletion handled (users reassigned or denied)

### Permission Enforcement (Backend)
- [ ] `CheckPermission` middleware blocks unauthorized API calls
- [ ] Correct HTTP method + path mapping to permission
- [ ] GET requests bypass permission check (read-only access)
- [ ] SuperAdmin bypasses all permission checks
- [ ] Unauthenticated requests properly rejected

### Permission Enforcement (Frontend)
- [ ] Sidebar nav items hidden when user lacks permission
- [ ] `can()` function correctly checks permission array
- [ ] Action buttons (Create, Edit, Delete) hidden when unauthorized
- [ ] `PermissionRoute` wrapper blocks direct URL access
- [ ] 403/Unauthorized page shown for unauthorized routes

---

## 4. Restaurant & Branch Management

### Restaurant CRUD
- [ ] Create restaurant with all fields succeeds
- [ ] Edit restaurant details succeeds
- [ ] Soft delete restaurant works
- [ ] Restaurant logo/image upload works
- [ ] Working hours update succeeds
- [ ] Tax settings update succeeds
- [ ] Payment methods configuration works
- [ ] Receipt/notification settings work
- [ ] Slug generation is unique
- [ ] Status toggle (active/inactive) works
- [ ] Trial period tracking works
- [ ] Currency setting scoped to restaurant

### Branch CRUD
- [ ] Create branch under restaurant succeeds
- [ ] Edit branch details succeeds
- [ ] Delete branch works (handles related data)
- [ ] Main branch flag logic correct
- [ ] Branch options API returns only user's branches
- [ ] Branch assignment to menu items works
- [ ] Branch-scoped data isolation verified

---

## 5. Menu Management

### Menu Categories
- [ ] Create category with name/image succeeds
- [ ] Edit category succeeds
- [ ] Delete category handles menu items (reassign or block)
- [ ] Tree structure API returns correct hierarchy
- [ ] Sort order update works
- [ ] Status toggle (active/inactive) works
- [ ] Category image upload and replacement works
- [ ] Soft delete and restore works

### Menu Items
- [ ] Create menu item with all fields succeeds
- [ ] Edit menu item succeeds
- [ ] Delete menu item handles order references
- [ ] Price and cost_price validation (numeric, positive)
- [ ] SKU uniqueness per restaurant
- [ ] Barcode uniqueness per restaurant
- [ ] Dietary flags (veg, vegan, gluten-free, etc.) save correctly
- [ ] Image upload and replacement works
- [ ] Variant creation and management works
- [ ] Modifier group assignment works
- [ ] Is-featured flag toggle works
- [ ] Is-combo flag logic works
- [ ] Preparation time field validated
- [ ] Branch assignment for menu items works
- [ ] Status toggle works

### Modifier Groups
- [ ] Create modifier group succeeds
- [ ] Add modifiers to group succeeds
- [ ] Edit modifier group succeeds
- [ ] Delete modifier group handles references
- [ ] Min/max selection validation works

### Legacy Categories/Addons/Variations
- [ ] Legacy endpoints still function for backward compatibility
- [ ] No duplicate data between legacy and new menu system

---

## 6. Table & Floor Management

### Floors
- [ ] Create floor with name/description succeeds
- [ ] Edit floor succeeds
- [ ] Delete floor handles table references
- [ ] Sort order update works

### Tables
- [ ] Create table with capacity/status succeeds
- [ ] Edit table succeeds
- [ ] Delete table handles reservation/order references
- [ ] QR code generation works on create
- [ ] QR token is unique per table
- [ ] Regenerate QR code works
- [ ] QR code image download works
- [ ] Status update (available, occupied, reserved, maintenance) works
- [ ] Available tables API returns correct results
- [ ] Capacity validation (positive integer)
- [ ] Floor association is validated

---

## 7. Reservation System

### Reservation CRUD
- [ ] Create reservation with customer/table/time succeeds
- [ ] Edit reservation succeeds
- [ ] Delete reservation works
- [ ] Overlapping reservation check works
- [ ] Table availability check for date/time range
- [ ] Guest count vs table capacity validation
- [ ] Past date reservation prevention

### Reservation Status Transitions
- [ ] Confirm reservation works
- [ ] Cancel reservation works (frees table)
- [ ] Seat reservation (marks as seated) works
- [ ] Complete reservation works
- [ ] No-show marking works
- [ ] Status transition validation (e.g., cannot confirm a completed reservation)
- [ ] Table status auto-updates on reservation status change

---

## 8. Point of Sale (POS)

### POS Session Management
- [ ] Start new POS session succeeds
- [ ] Open session check prevents duplicate sessions
- [ ] Close POS session succeeds (with summary)
- [ ] Session tied to correct branch/user

### Sales Creation
- [ ] Create sale with single item succeeds
- [ ] Create sale with multiple items succeeds
- [ ] Sale with modifiers on items works
- [ ] Subtotal calculation is correct
- [ ] Discount calculation (percentage/fixed) is correct
- [ ] Tax calculation is correct
- [ ] Delivery charge addition works
- [ ] Tip addition works
- [ ] Total calculation is correct (subtotal - discount + tax + delivery + tip)
- [ ] Invoice number generation is unique and sequential
- [ ] Order type (dine-in, takeaway, delivery) is recorded
- [ ] Table association works for dine-in
- [ ] Customer association works
- [ ] Kitchen notes and general notes save correctly

### Payment Processing
- [ ] Single payment method works
- [ ] Multiple payment methods work
- [ ] Amount paid validation (cannot exceed total without change)
- [ ] Change amount calculation is correct
- [ ] Payment status tracking (paid, partial, unpaid)
- [ ] Cash payment recording works
- [ ] Card payment recording works

### Hold / Recall / Cancel
- [ ] Hold order saves current state
- [ ] Recall held order restores state correctly
- [ ] Cancel order works
- [ ] Held orders list API returns correct data

### Merge Bills
- [ ] Merge multiple orders into single bill works
- [ ] Total recalculated correctly after merge
- [ ] Original orders marked as merged

### Refunds
- [ ] Full refund works
- [ ] Partial refund works
- [ ] Refund amount cannot exceed original payment
- [ ] Refund payment status updated correctly
- [ ] Inventory stock restored on refund (if applicable)

### Coupons
- [ ] Create coupon with rules succeeds
- [ ] Edit coupon succeeds
- [ ] Delete coupon works
- [ ] Coupon validation (expiry, usage limit, min order amount)
- [ ] Discount applied correctly to sale total
- [ ] Invalid/expired coupon rejected

### POS Settings
- [ ] POS settings update succeeds
- [ ] Settings affect POS terminal behaviour

### POS Sales List
- [ ] Sales list loads with correct data
- [ ] Pagination works
- [ ] Search/filter by date, status, customer works
- [ ] Sale detail view shows complete information

---

## 9. Kitchen Display System (KDS)

- [ ] Kitchen display shows pending orders
- [ ] Order status update (new, preparing, ready) works
- [ ] Priority update works
- [ ] Chef assignment works
- [ ] Real-time updates via event/listener (or polling)
- [ ] Order filtering by status works
- [ ] Sound/notification for new orders
- [ ] Kitchen display respects restaurant scoping
- [ ] Branch-scoped kitchen display works

---

## 10. Customer Display System (CDS)

- [ ] Public customer display shows order queue (no auth required)
- [ ] Settings page requires authentication
- [ ] Settings update succeeds
- [ ] Display refreshes with new orders
- [ ] Restaurant scoping applied to public endpoint

---

## 11. Guest Ordering (QR)

### Table Token Access
- [ ] Valid QR token returns table info
- [ ] Invalid/expired token returns appropriate error
- [ ] Token is not guessable (cryptographically random)

### Guest Menu
- [ ] Menu endpoint returns restaurant's active items only
- [ ] Out-of-stock items marked correctly
- [ ] Prices match restaurant configuration
- [ ] Categories and items properly filtered

### Order Placement
- [ ] Guest order with valid table token succeeds
- [ ] Guest order without auth works
- [ ] Order items and quantities validated
- [ ] Total calculated correctly
- [ ] Kitchen notes accepted
- [ ] Order created with correct status
- [ ] Table status updated after order

### Order Tracking
- [ ] Guest can track order by invoice number
- [ ] Order status reflects real-time updates
- [ ] Cannot track orders from other tables

---

## 12. Order Management

- [ ] Order list loads with correct scoped data
- [ ] Order detail shows all items, payments, status
- [ ] Order status update works
- [ ] Order deletion (soft delete) works
- [ ] Order filtering by status, date, customer works
- [ ] Pagination and search work correctly
- [ ] Export orders (if applicable) respects scoping

---

## 13. Customer & CRM

### Customer CRUD
- [ ] Create customer with details succeeds
- [ ] Edit customer succeeds
- [ ] Delete customer handles references (orders, loyalty, CRM)
- [ ] Customer list scoped to branch/restaurant
- [ ] Search by name/email/phone works
- [ ] Customer details (address, phone, notes) save correctly

### CRM Dashboard
- [ ] CRM dashboard shows correct metrics
- [ ] Customer 360-degree view loads all data

### CRM Notes
- [ ] Add note to customer succeeds
- [ ] Delete note works
- [ ] Notes timeline displays correctly

### CRM Segments
- [ ] Create segment with filters succeeds
- [ ] Edit segment succeeds
- [ ] Delete segment works
- [ ] Assign customers to segment works
- [ ] Segment count is accurate

### CRM Follow-ups
- [ ] Create follow-up succeeds
- [ ] Edit follow-up succeeds
- [ ] Complete follow-up works
- [ ] Delete follow-up works
- [ ] Follow-up list filtered correctly

---

## 14. Loyalty Programme

### Settings
- [ ] Loyalty settings (points per currency, redemption rules) save correctly
- [ ] Settings update requires permission

### Points Management
- [ ] Points earned on qualifying sale
- [ ] Points balance calculation is correct
- [ ] Point adjustment (manual) works
- [ ] Points transaction history is accurate

### Redemption
- [ ] Redeem preview shows correct conversion
- [ ] Redemption during POS sale applies correctly
- [ ] Points deducted after redemption
- [ ] Insufficient points rejected

### Customer Loyalty View
- [ ] Customer loyalty list loads correctly
- [ ] Transaction list shows accurate history

---

## 15. Inventory Management

### Items
- [ ] Create inventory item with all fields succeeds
- [ ] Edit inventory item succeeds
- [ ] Delete item handles references
- [ ] Category and supplier association works
- [ ] Unit management works
- [ ] Minimum stock level tracking works
- [ ] Cost price and current stock tracking works
- [ ] SKU uniqueness validation works

### Categories
- [ ] CRUD for inventory categories works
- [ ] Category deletion handles item references

### Stock Movements
- [ ] Stock overview shows correct current levels
- [ ] Stock transactions history is accurate
- [ ] Stock transfers between locations work
- [ ] Transfer receive confirmation works
- [ ] Stock adjustments work
- [ ] Adjustment approval workflow works
- [ ] Waste recording works
- [ ] Stock valuation calculation is correct

### Batches
- [ ] Batch tracking for inventory items works
- [ ] Batch expiry date tracking works
- [ ] FIFO/FEFO logic applied correctly

---

## 16. Purchasing & GRN

### Purchase Orders
- [ ] Create purchase order succeeds
- [ ] Edit purchase order succeeds
- [ ] Delete purchase order works
- [ ] Supplier association validated
- [ ] Item quantities and costs are correct
- [ ] Total calculation is correct

### Goods Received (GRN)
- [ ] Receive goods for purchase order works
- [ ] Partial receive works
- [ ] Full receive marks order as received
- [ ] Inventory stock updated on receive
- [ ] GRN reference generated

### Purchase Payments
- [ ] Record payment against purchase works
- [ ] Partial payment works
- [ ] Full payment marks as paid
- [ ] Payment history is accurate

### Purchase Returns
- [ ] Return goods works
- [ ] Inventory stock adjusted on return
- [ ] Return reference generated

---

## 17. Supplier Management

### Supplier CRUD
- [ ] Create supplier with all fields succeeds
- [ ] Edit supplier succeeds
- [ ] Delete supplier handles references
- [ ] Supplier list scoped correctly

### Supplier CRM
- [ ] Add supplier contacts works
- [ ] Delete supplier contacts works
- [ ] Upload supplier documents works
- [ ] Delete supplier documents works
- [ ] Record supplier transactions works
- [ ] Rate supplier works
- [ ] Supplier overview loads all data

---

## 18. Recipe Management

### Recipes
- [ ] Create recipe with ingredients succeeds
- [ ] Edit recipe succeeds
- [ ] Delete recipe works
- [ ] Ingredient quantities validated
- [ ] Cost calculation per recipe is correct

### Recipe Categories
- [ ] CRUD for recipe categories works
- [ ] Category deletion handles recipe references

### Recipe Options
- [ ] Recipe options endpoint returns correct data for selection

---

## 19. Accounting & Finance

### Chart of Accounts
- [ ] Create account with parent succeeds
- [ ] Edit account succeeds
- [ ] Delete account handles journal entries
- [ ] Account tree structure is correct
- [ ] Account code uniqueness per restaurant
- [ ] Account type validation (asset, liability, equity, income, expense)

### Income
- [ ] Record income succeeds
- [ ] Edit income record succeeds
- [ ] Delete income works
- [ ] Income summary is correct

### Expenses
- [ ] Record expense succeeds
- [ ] Edit expense record succeeds
- [ ] Delete expense works
- [ ] Expense summary is correct

### Expense Categories
- [ ] CRUD for expense categories works
- [ ] Category deletion handles expense references

### Cash & Bank
- [ ] Cash/bank accounts listed correctly
- [ ] Transactions against cash/bank work
- [ ] Balance calculation is correct

### Journal Entries
- [ ] Create journal entry with debits/credits succeeds
- [ ] Debit = Credit validation enforced
- [ ] Edit journal entry works
- [ ] Journal ledger shows correct entries
- [ ] Ledger per account is accurate

### Reports
- [ ] Trial balance debits = credits
- [ ] Profit & Loss report is accurate
- [ ] Balance sheet equation holds (Assets = Liabilities + Equity)
- [ ] Cash flow report is accurate
- [ ] Accounting dashboard metrics are correct

---

## 20. HRM & Payroll

### Departments
- [ ] CRUD for departments works
- [ ] Department deletion handles employee references

### Designations
- [ ] CRUD for designations works
- [ ] Designation deletion handles employee references
- [ ] Designation filtering by department works

### Employees
- [ ] Create employee with all fields succeeds
- [ ] User account association works
- [ ] Edit employee succeeds
- [ ] Delete employee handles references
- [ ] Employee list scoped to branch/restaurant
- [ ] Employment type validation works
- [ ] Salary field validated

### Attendance
- [ ] Record attendance succeeds
- [ ] Edit attendance succeeds
- [ ] Delete attendance works
- [ ] Date and status validation works

### Leave Requests
- [ ] Create leave request succeeds
- [ ] Approve leave request works
- [ ] Reject leave request works
- [ ] Date overlap validation works
- [ ] Leave balance tracking works

### Holidays
- [ ] CRUD for holidays works
- [ ] Holiday date validation works

### Payroll
- [ ] Generate payroll for employee succeeds
- [ ] Add allowances works
- [ ] Add deductions works
- [ ] Working hours calculation is correct
- [ ] Net pay calculation is correct
- [ ] Edit payroll works
- [ ] Payroll view shows breakdown

---

## 21. Reports & Analytics

### Sales Reports
- [ ] Sales report filtered by date range is accurate
- [ ] Sales report filtered by branch is accurate
- [ ] Export sales report works

### Purchase Reports
- [ ] Purchase report filtered by date range is accurate
- [ ] Export purchase report works

### Tax Reports
- [ ] Tax report shows correct tax collected
- [ ] Tax report filtered by date works

### Expense Reports
- [ ] Expense report filtered by date/category is accurate
- [ ] Export expense report works

### Platform Reports (Super Admin)
- [ ] Package report is accurate
- [ ] Plan report is accurate
- [ ] Subscription report is accurate
- [ ] Restaurant report is accurate

---

## 22. Notifications

### In-App Notifications
- [ ] Notifications list loads correctly
- [ ] Unread count is accurate
- [ ] Mark single notification as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Notifications scoped to user/restaurant

### Notification Settings
- [ ] Email notification toggle works
- [ ] SMS notification toggle works
- [ ] Settings update persists

### SMS Templates
- [ ] Create SMS template works
- [ ] Edit SMS template works
- [ ] Delete SMS template works
- [ ] Template variables work correctly

### Test Notifications
- [ ] Test email send works
- [ ] Test SMS send works

---

## 23. Subscription & SaaS

### Plans
- [ ] CRUD for plans works
- [ ] Plan features validation works
- [ ] Trial days configuration works

### Packages
- [ ] CRUD for packages works
- [ ] Module assignment to package works
- [ ] Package linked to plans correctly

### Subscriptions
- [ ] Create subscription for restaurant works
- [ ] Edit subscription works
- [ ] Delete subscription works
- [ ] Subscription modules endpoint returns correct data
- [ ] Expired subscription blocks module access
- [ ] Trial subscription works with trial_ends_at
- [ ] Cancelled subscription handling works
- [ ] Module access check respects subscription status

---

## 24. Super Admin Panel

### Dashboard
- [ ] Dashboard stats (restaurants, users, subscriptions) are accurate
- [ ] Platform stats are accurate
- [ ] Charts render correctly

### Restaurant Management
- [ ] Super admin can view all restaurants
- [ ] Super admin can create/edit restaurants
- [ ] Restaurant status management works

### Website Settings
- [ ] Website settings update succeeds
- [ ] Settings reflect on public-facing pages

### FAQs
- [ ] CRUD for FAQs works
- [ ] FAQ ordering works

### Platform Reports
- [ ] Overview report is accurate
- [ ] Package report is accurate
- [ ] Plan report is accurate
- [ ] Subscription report is accurate
- [ ] Restaurant report is accurate

---

## 25. Installer

### Requirements Check
- [ ] PHP version check works
- [ ] Extension checks work
- [ ] Directory permission checks work
- [ ] Clear error messages for failed checks

### Permissions Check
- [ ] Storage directory writable check
- [ ] Bootstrap/cache writable check
- [ ] .env file writable check
- [ ] Clear remediation instructions

### Environment Setup
- [ ] Database connection details validated
- [ ] .env file generated correctly
- [ ] APP_KEY generated
- [ ] APP_URL configured correctly

### Admin Setup
- [ ] Admin user creation works
- [ ] Password validation enforced
- [ ] Email uniqueness check

### Installation Progress
- [ ] Migration runs successfully
- [ ] Seeder runs successfully
- [ ] Completion message shown
- [ ] Redirect to application after install
- [ ] Installation lock prevents re-install

---

## 26. Frontend / UI

### Layout & Navigation
- [ ] Sidebar renders all permitted nav items
- [ ] Sidebar collapses/expands correctly
- [ ] Top navigation bar renders correctly
- [ ] Breadcrumbs work correctly
- [ ] Active route highlighting works
- [ ] Sidebar scroll works for many items

### Forms
- [ ] All forms have proper validation messages
- [ ] Required field indicators shown
- [ ] Form submission loading state shown
- [ ] Success/error toasts displayed
- [ ] Form reset on success works
- [ ] Unsaved changes warning on navigation

### Tables / Data Lists
- [ ] Paginated list response unwrapping uses safe pattern (`res.data?.data?.data || res.data?.data || []`)
- [ ] Total count displays correctly (`res.data?.meta?.total || res.data?.data?.total`)
- [ ] Pagination controls work (next, prev, page size)
- [ ] Search/filter works
- [ ] Sort by column works
- [ ] Empty state shown when no data
- [ ] Loading skeleton/spinner shown during fetch

### Modals / Dialogs
- [ ] Open/close modal works
- [ ] Confirm delete dialog works
- [ ] Modal focus trap works
- [ ] ESC key closes modal
- [ ] Backdrop click closes modal

### Dark Mode
- [ ] Theme toggle works
- [ ] All pages render correctly in dark mode
- [ ] All forms are readable in dark mode
- [ ] Tables are readable in dark mode
- [ ] Charts render correctly in dark mode
- [ ] Modals/dialogs are readable in dark mode
- [ ] Color contrast meets accessibility standards

### Responsive Design
- [ ] Desktop layout is correct (1200px+)
- [ ] Tablet layout is correct (768px - 1199px)
- [ ] Mobile layout is correct (< 768px)
- [ ] Sidebar becomes drawer on mobile
- [ ] Tables horizontal scroll on mobile
- [ ] Forms stack on mobile
- [ ] POS terminal is usable on tablet

### Error Pages
- [ ] 404 page shows for invalid routes
- [ ] 403/Unauthorized page shows for forbidden access
- [ ] 500 error page shows for server errors
- [ ] Error pages have navigation back to dashboard

---

## 27. API Standards

### Response Format
- [ ] All responses use consistent JSON structure (`status`, `message`, `data`, `errors`)
- [ ] Success responses include correct HTTP status codes (200, 201, 204)
- [ ] Error responses include correct HTTP status codes (400, 401, 403, 404, 422, 500)
- [ ] Validation errors return field-specific messages
- [ ] Pagination metadata included for list endpoints

### Request Validation
- [ ] All POST/PUT endpoints validate required fields
- [ ] Type validation enforced (string, integer, boolean, array)
- [ ] Max length validation on string fields
- [ ] Numeric fields validated for format
- [ ] Email format validation
- [ ] URL format validation (where applicable)
- [ ] Enum values validated (status, type, etc.)
- [ ] File upload validation (type, size)

### Rate Limiting
- [ ] API rate limit (120/min) enforced
- [ ] Rate limit headers returned
- [ ] 429 response on limit exceeded

---

## 28. Security

### SQL Injection
- [ ] All queries use parameterized bindings (Eloquent/Query Builder)
- [ ] No raw SQL with user input
- [ ] Search/filter inputs sanitized

### XSS (Cross-Site Scripting)
- [ ] React auto-escapes JSX output
- [ ] User input not rendered as raw HTML (no `dangerouslySetInnerHTML` with user data)
- [ ] Rich text editor output sanitized (TipTap)
- [ ] Image URLs validated before rendering

### CSRF (Cross-Site Request Forgery)
- [ ] CSRF token validated on all state-changing requests
- [ ] Sanctum SPA authentication provides CSRF protection

### Authentication Security
- [ ] Passwords hashed with bcrypt/argon2
- [ ] Passwords never logged or exposed in API responses
- [ ] Session tokens are HttpOnly, Secure, SameSite
- [ ] No sensitive data in localStorage
- [ ] Session fixation prevented
- [ ] Session invalidation on password change

### Authorization Security
- [ ] IDOR (Insecure Direct Object Reference) prevented — all resource access checked against tenant
- [ ] Horizontal privilege escalation prevented (user A cannot access user B's data)
- [ ] Vertical privilege escalation prevented (regular user cannot access admin endpoints)
- [ ] Batch/bulk operations respect authorization

### File Upload Security
- [ ] File type validation (MIME type + extension)
- [ ] File size limits enforced
- [ ] Uploaded files stored outside public web root (or properly secured)
- [ ] File names randomized (no user-controlled file paths)
- [ ] Directory traversal prevention

### API Security
- [ ] No sensitive data in URL query parameters
- [ ] Bearer token not logged
- [ ] Error messages do not expose stack traces
- [ ] Error messages do not expose database structure
- [ ] CORS configured correctly (only allowed origins)
- [ ] Content-Type validation on requests

### Data Security
- [ ] Sensitive fields (password, tokens) excluded from API responses
- [ ] Activity log sanitizes sensitive request data
- [ ] Backup files secured (not publicly accessible)
- [ ] Environment variables not exposed to frontend
- [ ] API keys and secrets not in version control

### Input Validation
- [ ] Server-side validation on all endpoints (not just frontend)
- [ ] Mass assignment protection (fillable/guarded on models)
- [ ] Type casting on model attributes
- [ ] Date format validation
- [ ] Numeric overflow/underflow prevention

---

## 29. Performance

### Database
- [ ] N+1 query prevention (eager loading)
- [ ] Proper indexing on foreign keys
- [ ] Indexes on frequently searched columns
- [ ] Soft delete indexes in place
- [ ] Query count per page acceptable (< 20 queries)
- [ ] Large dataset pagination performance tested

### Caching
- [ ] Translation cache works
- [ ] Permission cache works
- [ ] Menu/category cache works (if applicable)
- [ ] Dashboard stats cached appropriately

### Frontend
- [ ] Initial page load < 3 seconds
- [ ] Code splitting / lazy loading works
- [ ] Image optimization (compression, lazy loading)
- [ ] Bundle size acceptable
- [ ] No memory leaks on navigation
- [ ] Infinite scroll (if used) performs well

### API
- [ ] Response times < 500ms for standard endpoints
- [ ] List endpoints with large datasets perform well
- [ ] File upload endpoints handle large files
- [ ] Export endpoints stream data (not load all into memory)

---

## 30. Offline / PWA

### Service Worker
- [ ] PWA manifest is valid
- [ ] Service worker registers correctly
- [ ] Static assets cached for offline use
- [ ] Network-first strategy for API calls

### IndexedDB (Dexie)
- [ ] Offline database initializes correctly
- [ ] Cart data persists offline
- [ ] Menu data cached for offline viewing
- [ ] Online sync reconciles offline changes
- [ ] Conflict resolution works

### Network Status
- [ ] Online/offline indicator shown
- [ ] Offline mode disables network-dependent features
- [ ] Reconnection syncs pending data

---

## 31. Database & Data Integrity

### Migrations
- [ ] All migrations run cleanly on fresh database
- [ ] Foreign key constraints enforced
- [ ] Unique constraints enforced
- [ ] Default values set correctly
- [ ] Nullable fields handled correctly
- [ ] Timestamps (created_at, updated_at) populated

### Seeders
- [ ] UserSeeder creates all permissions
- [ ] Super admin role has all permissions
- [ ] Demo data seeded correctly (if applicable)
- [ ] Seeders are idempotent (can run multiple times)

### Data Relationships
- [ ] Cascade deletes work correctly
- [ ] Soft deletes preserve related data
- [ ] Orphaned records prevented
- [ ] Transaction atomicity on critical operations (sales, payroll, accounting)

### Backup & Restore
- [ ] Database backup creates valid file
- [ ] Backup download works
- [ ] Restore from backup works
- [ ] Backup files are secured
- [ ] Restore handles existing data correctly

---

## 32. Internationalization (i18n)

### Backend
- [ ] All controller response messages use `trans()` helper
- [ ] Language files exist for all modules
- [ ] Placeholder replacement works ({item}, {count})
- [ ] Default locale (en) fallback works

### Frontend
- [ ] All user-facing strings wrapped with `t()`
- [ ] No hardcoded strings in components
- [ ] Language switching works
- [ ] Translation keys resolve correctly
- [ ] Fallback to default locale works
- [ ] Date/time formatting respects locale
- [ ] Number/currency formatting respects locale

---

## 33. Cross-Browser & Responsive

### Browsers
- [ ] Chrome (latest) — full functionality
- [ ] Firefox (latest) — full functionality
- [ ] Safari (latest) — full functionality
- [ ] Edge (latest) — full functionality
- [ ] Mobile Chrome (Android) — full functionality
- [ ] Mobile Safari (iOS) — full functionality

### Responsive Breakpoints
- [ ] Mobile (< 768px) — single column, stacked layout
- [ ] Tablet (768px - 1199px) — two column where appropriate
- [ ] Desktop (1200px+) — full sidebar + content layout
- [ ] Large desktop (1440px+) — no layout issues

### Touch Interactions
- [ ] Touch targets are at least 44x44px
- [ ] Swipe gestures work on touch devices
- [ ] Pinch-to-zoom on images works
- [ ] Long press does not trigger unintended actions

---

## 34. Deployment & Environment

### Environment Configuration
- [ ] `.env.example` contains all required variables
- [ ] APP_ENV, APP_DEBUG, APP_URL configured correctly
- [ ] Database credentials not hardcoded
- [ ] Mail driver configured
- [ ] Queue driver configured
- [ ] Cache driver configured
- [ ] Session driver configured
- [ ] Storage symlink created

### Build
- [ ] `composer install` completes without errors
- [ ] `npm install` completes without errors
- [ ] `php artisan migrate` completes without errors
- [ ] `php artisan db:seed` completes without errors
- [ ] `npm run build` (Vite) completes without errors
- [ ] Frontend build output in correct directory

### Production Checks
- [ ] APP_DEBUG=false in production
- [ ] HTTPS enforced
- [ ] Cache cleared (`php artisan cache:clear`)
- [ ] Config cached (`php artisan config:cache`)
- [ ] Route cached (`php artisan route:cache`)
- [ ] View cached (`php artisan view:cache`)
- [ ] Storage link exists (`php artisan storage:link`)
- [ ] Queue workers running (if using queues)
- [ ] Scheduler running (if using scheduled tasks)

---

## Test Data Scenarios

### Critical Path Tests

1. **Complete Sale Flow:**
   - Start POS session → Add items → Apply coupon → Process payment → Close session → Verify inventory → Check accounting entry → Verify reports

2. **Guest Order Flow:**
   - Scan QR → View menu → Place order → Track order → Kitchen receives → Kitchen marks ready → Verify order status

3. **Reservation Flow:**
   - Create reservation → Confirm → Seat → Complete → Verify table status → Check reservation history

4. **Inventory Flow:**
   - Create item → Purchase stock → Receive goods → Stock transfer → Adjust stock → Record waste → Verify stock levels

5. **Payroll Flow:**
   - Create employee → Record attendance → Submit leave → Approve leave → Generate payroll → Verify calculations

6. **Accounting Flow:**
   - Record income → Record expense → Create journal entry → Verify trial balance → Generate P&L → Generate balance sheet

---

## Sign-Off

| Area | Tester | Date | Status |
|------|--------|------|--------|
| Authentication | | | |
| Multi-Tenancy | | | |
| Permissions | | | |
| Restaurant/Branch | | | |
| Menu | | | |
| Table/Floor | | | |
| Reservations | | | |
| POS | | | |
| Kitchen Display | | | |
| Guest Ordering | | | |
| Orders | | | |
| Customer/CRM | | | |
| Loyalty | | | |
| Inventory | | | |
| Purchasing | | | |
| Supplier | | | |
| Recipe | | | |
| Accounting | | | |
| HRM/Payroll | | | |
| Reports | | | |
| Notifications | | | |
| Subscription/SaaS | | | |
| Super Admin | | | |
| Installer | | | |
| Frontend/UI | | | |
| API Standards | | | |
| Security | | | |
| Performance | | | |
| Offline/PWA | | | |
| Database | | | |
| i18n | | | |
| Cross-Browser | | | |
| Deployment | | | |
