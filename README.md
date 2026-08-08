<div align="center">

# Restaurant POS Management System

A modular, production-ready **Restaurant Management & Point of Sale (POS)** platform built with **Laravel 12**, **React 19** and **Chakra UI**.

</div>

---

## Overview

This application is a complete restaurant management solution covering POS operations, kitchen display (KOT/KDS), inventory, purchasing, orders, reservations, table management, HRM, payroll, accounting, loyalty, subscriptions and reporting. The codebase is organised into independent business modules built on the **nWidart Laravel Modules** architecture for clean separation, maintainability and scalability.

## Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| Backend      | Laravel 12, PHP 8.2+                                               |
| Frontend     | React 19, Chakra UI 2, Vite 7, TanStack Table, Recharts           |
| Modularity   | nwidart/laravel-modules                                            |
| Auth         | Laravel Sanctum (HTTP-only cookies), Spatie Laravel Permission     |
| Database     | MySQL (compatible with PostgreSQL / SQLite via Laravel config)     |
| Tooling      | Pint, PHPUnit, React Query, react-i18next                          |

## Features

- **POS** — Multi-payment processing, split/merge bills, refunds, held orders, session management
- **Orders** — Dine-in, takeaway, delivery; KOT / Kitchen Display integration
- **Menu** — Categories, menu items, modifiers, recipes, pricing
- **Table Management** — Floors, tables, reservations, table QR ordering
- **Inventory & Purchasing** — Stock tracking, suppliers, purchase orders, low-stock alerts
- **Kitchen Display (KDS)** — Live order queues, priority and status management
- **Customer & CRM** — Customers, loyalty points, reviews, notifications
- **HRM & Payroll** — Employees, shifts, attendance, leave, payroll
- **Accounting** — Chart of accounts, journal entries, income/expense, cash & bank
- **Super Admin** — Multi-tenant restaurants, branches, packages, plans, subscriptions
- **Reports & Analytics** — Sales, cash movements, order type/status distribution, branch comparisons
- **i18n** — Translation-ready frontend and backend language files
- **Dark / Light mode** — Full theming support across all pages

## Requirements

- PHP **8.2** or higher with required extensions (`pdo_mysql`, `mbstring`, `openssl`, `xml`, `ctype`, `curl`, `gd`, `zip`)
- Composer 2
- Node.js 20+ and npm
- MySQL 8.0+ (or MariaDB 10.6+)

## Installation

### 1. Clone the project

```bash
git clone <repository-url> restaurant
cd restaurant
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Environment configuration

```bash
copy .env.example .env    # Windows
# or
cp .env.example .env      # Linux / macOS
```

Then open `.env` and configure your database connection and application URL:

```env
APP_NAME=Restaurant
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Generate application key

```bash
php artisan key:generate
```

### 5. Run migrations and seeders

```bash
php artisan migrate --seed
```

This creates the database schema (including all module migrations) and seeds:

- All roles and permissions
- A **super_admin** account
- A **restaurant_owner** account
- A demo restaurant and branch (via the demo seeder, see below)

### 6. Build the frontend

```bash
npm install
npm run build
```

For local development with hot reload use:

```bash
npm run dev
```

### 7. Start the server

```bash
php artisan serve
```

The application is now available at `http://localhost:8000`.

## Default Credentials

| Role             | Email                | Password   |
| ---------------- | -------------------- | ---------- |
| Super Admin      | `superadmin@gmail.com` | `123456789` |
| Restaurant Owner | `owner@gmail.com`      | `123456789` |

> **Important:** Change these credentials immediately after the first login.

## Optional: Demo Data

To load a full set of demo records (menu items, tables, orders, inventory, etc.) suitable for exploring the application, run:

```bash
php artisan db:seed --class=Database\\Seeders\\DemoSeeder
```

The demo seeder is idempotent — running it repeatedly will not create duplicate records.

## Development

### Directory structure

```
app/                        # Application-wide services, helpers
database/seeders/           # Global seeders (roles, permissions, demo data)
Modules/
├── Accounting/
├── Analytics/
├── Auth/
├── Branch/
├── Customer/
├── ...
└── SuperAdmin/
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   └── Requests/       # Form Request validation classes
    │   ├── Services/           # Business logic
    │   ├── Repositories/       # Data access layer
    │   ├── Models/
    │   └── Resources/          # API resources
    ├── database/migrations/
    ├── database/seeders/
    ├── lang/en/                # Backend translation files
    └── routes/api.php
resources/js/src/           # React frontend
    ├── components/
    ├── context/            # Auth, Permission, Language providers
    ├── pages/
    └── routes/
```

Each module owns its routes, controllers, requests, services, repositories, models, resources, migrations, seeders and language files, keeping the codebase loosely coupled and easy to extend.

### Common commands

```bash
php artisan module:list                 # List all modules
php artisan module:make <Name>          # Create a new module
php artisan db:seed                     # Re-seed roles & permissions (idempotent)
npm run build                           # Production frontend build
composer test                           # Run the test suite
```

## API

RESTful JSON APIs are grouped per module under `/api` and protected by Sanctum authentication, role-based permissions and request throttling. Every endpoint returns a consistent response envelope (`status`, `message`, `data`, `errors`, pagination metadata).

Interactive API documentation can be generated with the bundled **Scribe** package:

```bash
php artisan scribe:generate
```

## Security

- HTTP-only cookie authentication (no tokens in browser storage)
- CSRF protection enabled
- Role & permission middleware on every protected route
- Request throttling (`throttle:60,1`) applied to all API routes
- Form Request validation on every write endpoint
- File uploads handled exclusively through the central `uploadImage()` helper

## License

This is a proprietary commercial application. Redistribution and resale are subject to the terms of the original license agreement.
