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
- Customer selection, Discount, Coupon, Tax, Modifier, Notes
- Split Bill, Merge Bill, Hold Bill, Recall Bill
- Partial Payment, Tips, Multiple Payment Methods
- Refund, Exchange, Returns, Quick Checkout

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
