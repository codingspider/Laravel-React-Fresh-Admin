# AI Coding Rules

## Token Efficiency
- Be extremely concise.
- Do not explain unless explicitly asked.
- Do not repeat requirements or completed work.
- Do not narrate reasoning or actions.
- Do not inspect unrelated files.
- Do not modify unrelated code.
- Make the smallest possible change.
- Reuse existing code and project patterns.
- Do not create files unless required.
- Do not ask questions when the task is clear.
- Never repeat a failed approach without first identifying the cause.
- Do not output large code blocks unless requested.

## Implementation
- Inspect only relevant files.
- Follow existing architecture and coding patterns.
- Preserve all working functionality.
- Prefer minimal targeted changes over refactoring.
- Complete the task directly when requirements are clear.

## Final Response
After completing the task, respond with only:
1. What changed.
2. Any remaining issue.



# Development Guidelines & Coding Standards

The project must be developed with a strong focus on **clean architecture, maintainability, scalability, performance, and CodeCanyon compatibility**. Every implementation should follow Laravel and React best practices while ensuring the codebase remains easy to understand, extend, and maintain.

## General Coding Standards

* PSR-12 Coding Standard অনুসরণ করা
* Clean Architecture
* SOLID Principles
* DRY (Don't Repeat Yourself)
* Proper Service Layer
* Repository Pattern (যেখানে প্রয়োজন)
* Reusable Components
* No duplicated code
* No unused files
* No commented-out production code
* Proper Exception Handling
* Proper Validation
* Proper Logging
* Adhere to **SOLID principles**, **DRY (Don't Repeat Yourself)**, and **KISS (Keep It Simple)**.
* Write clean, readable, and self-documenting code.
* Use meaningful class, method, variable, and file names.
* Keep methods small and focused on a single responsibility.
* Avoid duplicate code by extracting reusable logic into services, helpers, or traits where appropriate.
* Every class, method, and complex business logic should include clear PHPDoc comments and inline documentation when necessary.

## Project Architecture

The application should be built using a **modular architecture** with **nWidart Laravel Modules**.

```bash
composer require nwidart/laravel-modules
```

Each business domain must be implemented as an independent module.

Examples include:

* Authentication
* Dashboard
* Restaurant
* Branch Management
* POS
* Orders
* Kitchen (KOT/KDS)
* Inventory
* Purchasing
* CRM
* HRM
* Payroll
* Accounting
* Reports
* Settings
* SaaS
* Subscription
* User Management
* Notifications

Each module should contain its own:

* Routes
* Controllers
* Requests
* Services
* Repositories
* Models
* Resources
* Policies
* Events
* Listeners
* Jobs
* Migrations
* Seeders
* Tests

Modules should remain independent and loosely coupled.

## Route Organisation

Routes must remain clean and minimal.

* Controllers should only receive requests and return responses.
* Business logic must never be written inside route files.
* Group routes by module.
* Use route names consistently.
* Protect routes with middleware and permissions.
* Keep API and Web routes separated.

## Controller Responsibilities

Controllers should only:

* Validate incoming requests
* Call service classes
* Return API resources or views
* Handle exceptions gracefully

Controllers must never contain business logic.

## Business Logic

All business logic must be moved into dedicated Service classes.

Example:

* UserService
* RestaurantService
* OrderService
* InventoryService
* PaymentService
* KitchenService

Services should communicate with repositories and other services where appropriate.

## Validation

Do not place validation directly inside controllers.

Use dedicated Form Request classes for every endpoint.

For reusable validation logic:

* Create custom validation rules.
* Create reusable validation services when necessary.

Validation should be centralised and easy to maintain.

## Repository Pattern

Use repositories to separate database access from business logic.

Services should communicate with repositories instead of directly querying models whenever complex data access is required.

## File Uploads

Never duplicate upload logic.

Always use the existing helper function:

```php
uploadImage(...)
```

The helper should handle:

* Image upload
* File upload
* Replacement
* Deletion
* Validation
* Storage path generation
* Unique file names

No controller or service should manually move uploaded files.

## Authentication

Use Laravel's built-in authentication system with:

* Laravel Sanctum
* HTTP-only cookies
* Secure session authentication

Requirements:

* No localStorage authentication
* No session tokens stored in JavaScript
* CSRF protection enabled
* Secure cookie configuration
* Remember Me support
* Password reset
* Email verification
* Multi-device logout

Assume this authentication system already exists and extend it where necessary instead of replacing it.

## Database Standards

* Follow Laravel naming conventions.
* Use foreign key constraints.
* Add indexes where appropriate.
* Use soft deletes when applicable.
* Avoid duplicated columns.
* Use database transactions for critical operations.
* Optimise queries to prevent N+1 issues.
* Prefer eager loading when required.

## API Standards

Every API should return a consistent JSON response format.

Include:

* Status
* Message
* Data
* Errors
* Pagination metadata (when applicable)

Use Laravel API Resources instead of returning models directly.

## Error Handling

* Handle all exceptions gracefully.
* Log unexpected errors.
* Return meaningful error messages.
* Never expose sensitive system information.

## Permissions & Security

Use **Spatie Laravel Permission**.

### Roles

The following roles are seeded and available:

| Role | Description |
|---|---|
| `super_admin` | Full access to all modules and settings |
| `admin` | Full access (same as super_admin, kept for extensibility) |
| `restaurant_owner` | Full access to own restaurant data |

### Permission Naming Convention

Permissions follow the pattern: `{action}_{entity}`

Actions: `view`, `create`, `update`, `delete`
Entities: module-specific nouns (e.g., `restaurants`, `menu_items`, `tables`)

Examples:
* `view_restaurants`
* `create_menu_items`
* `update_reservations`
* `delete_floors`

### Permission Groups by Module

**Restaurant**: `view_restaurants`, `create_restaurants`, `update_restaurants`, `delete_restaurants`

**Branch**: `view_branches`, `create_branches`, `update_branches`, `delete_branches`

**Menu**: `view_menu_categories`, `create_menu_categories`, `update_menu_categories`, `delete_menu_categories`, `view_menu_items`, `create_menu_items`, `update_menu_items`, `delete_menu_items`, `view_modifier_groups`, `create_modifier_groups`, `update_modifier_groups`, `delete_modifier_groups`

**Table Management**: `view_floors`, `create_floors`, `update_floors`, `delete_floors`, `view_tables`, `create_tables`, `update_tables`, `delete_tables`, `view_reservations`, `create_reservations`, `update_reservations`, `delete_reservations`

**Orders**: `view_orders`, `create_orders`, `update_orders`, `delete_orders`

**POS**: `view_pos`, `process_sale`

**Inventory**: `view_inventory`, `create_inventory`, `update_inventory`, `delete_inventory`

**Purchasing**: `view_purchases`, `create_purchases`, `update_purchases`, `delete_purchases`

**Kitchen**: `view_kitchen_display`, `manage_kitchen_orders`

**Delivery**: `view_deliveries`, `manage_deliveries`

**Users**: `view_user`, `create_user`, `update_user`, `delete_user`

**Roles**: `role_list`, `role_create`, `role_edit`, `role_delete`, `assign_roles`, `view_permissions`

**Reports**: `view_reports`

**Settings**: `view_dashboard_data`, `access_business_settings`, `access_invoice_settings`

### Seeder

All permissions and roles are seeded in `database/seeders/UserSeeder.php`. When adding a new module:

1. Add its permissions to the `$permissions` array in `UserSeeder.php`
2. Assign relevant permissions to each role in their respective `syncPermissions()` calls
3. Run `php artisan db:seed` to re-seed, Note: data should not be wiped and should not be duplicates

### Frontend Permission Check

The sidebar and UI elements use the `can()` function from `PermissionContext`:

```jsx
import { usePermission } from '../../context/PermissionContext';
const { can } = usePermission();

// In sidebar (SidebarContent.jsx), nav items have a `permission` property
// Items are hidden if the user lacks the permission

// In components
{can('create_restaurants') && <Button>Add Restaurant</Button>}
```

The `/user` API endpoint returns the authenticated user's permission names as a flat array. The `PermissionContext` stores these and the `can()` function checks membership.

### Rules

* Every protected action must be permission-based.
* The `super_admin` and `admin` roles receive ALL permissions via `$allPermissions`.
* When creating new module routes, always add corresponding permissions to the seeder.
* Sidebar nav items MUST have a `permission` property matching a seeder permission name.
* Never hardcode permission checks — always use the `can()` helper from `PermissionContext`.

## Frontend Standards (React)

* Use a feature-based folder structure.
* Create reusable components.
* Keep pages lightweight.
* Use custom hooks where appropriate.
* Separate UI from business logic.
* Centralise API communication.
* Use React Query (or an equivalent solution) for server state.
* Follow consistent naming conventions.
* Build responsive interfaces with Chakra UI.

### Paginated List Response Unwrapping (CRITICAL — recurring bug)

Laravel paginators are serialised as an object with a `data` key, so a `data` payload that is paginated nests the array one level deeper. When reading list data from ANY API response, ALWAYS use the safe unwrapping pattern — never read `res.data?.data` directly (that returns the paginator object, not the array, and the list renders empty):

```js
const items = res.data?.data?.data || res.data?.data || [];
const total = res.data?.meta?.total || res.data?.data?.total || items.length;
```

This pattern handles all three shapes:
- `{ data: [ ... ] }` (plain array) → `res.data.data`
- `{ data: { data: [ ... ], total: N } }` (paginator nested in `data`) → `res.data.data.data`
- `{ data: { data: [ ... ] }, meta: { total: N } }` (paginator + `meta`) → `res.data.data.data` + `res.data.meta.total`

**This bug has occurred repeatedly across list pages (InventoryCategoryList, SupplierList, InventoryItemList, AddonList, BranchList, CurrencyList, CategoryList, RestaurantList, MenuCategoryList, MenuItemList, ModifierGroupList, POSSalesList, ItemList, VariationList, TableList, ReservationList, FloorList). Every new list page MUST use the pattern above.**


## Localization & Language Files

All static text must be stored in language files — never hardcode strings in controllers, services, or other PHP classes.

Each module must have its own `lang/en/` directory containing structured language files:

```
Modules/{Module}/
└── lang/
    └── en/
        ├── module.php        # General module messages
        ├── validation.php    # Validation messages
        └── emails.php        # Email-related text (if applicable)
```

React frontend must use lang key like t('home')

### Usage in Controllers

```php
// Use trans() helper with placeholder replacement
return response()->json([
    'status' => 'success',
    'message' => trans('modules::module.created', ['item' => 'Restaurant']),
    'data' => $restaurant,
], 201);

// For validation messages, use trans_choice for pluralization
return response()->json([
    'status' => 'error',
    'message' => trans('modules::module.not_found', ['item' => 'Restaurant']),
], 404);
```

### Service Provider Registration

Each module's ServiceProvider must load its lang files:

```php
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
    $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
    $this->loadTranslationsFrom(__DIR__ . '/../../lang', '{module}');
}
```

### Requirements

* Every controller response message must use `trans()` with keys from the module's language file.
* Never hardcode user-facing strings in controllers, services, or resources.
* Use `{item}` placeholder for dynamic entity names.
* Use `{count}` placeholder for bulk operation counts.
* Keep language files well-organised and alphabetically sorted.
* Default locale is English (`en`). Additional languages can be added later under `lang/{locale}/`.
* Validation messages should be placed in the `validation.php` file within each module.

## Code Quality

The application should be:

* Clean
* Readable
* Modular
* Testable
* Reusable
* Extensible
* Well documented
* Production-ready

Every new feature should integrate seamlessly without affecting existing modules.

## CodeCanyon Compatibility

The project must comply with CodeCanyon quality expectations.

Requirements include:

* Well-organised folder structure
* Consistent coding style
* No hard-coded values
* Environment-driven configuration
* Easy installation
* Easy customisation
* Clean database migrations
* Seeder support
* Optimised performance
* Secure implementation
* Comprehensive documentation
* Reusable architecture
* Maintainable and scalable codebase

Every implementation should be written as if it will be reviewed by professional developers, ensuring high code quality, long-term maintainability, and ease of future enhancement.



## Frontend Development Requirements (Before Phase 2)

Before proceeding to **Phase 2**, complete the frontend implementation using **React (JSX)** and **Chakra UI**.

### Development Guidelines

* Build the frontend using **React (JSX)** with **Chakra UI** components only.
* Review the **existing database table structures** before implementing each module to ensure all fields are properly represented.
* For every module, create the necessary pages and reusable components, including:

  * List (Data Table)
  * Create
  * Edit
  * View (where applicable)
  * Delete confirmation
  * Filters
  * Search
  * Pagination
  * Form validation
* Reuse common components whenever possible to maintain consistency and reduce duplicate code.
* Follow the existing project architecture and coding standards established throughout the application.

### Internationalisation (i18n)

* Wrap **all user-facing text** with the translation helper:

  ```jsx
  t('Your Text')
  ```
* Do not hard-code any labels, buttons, placeholders, validation messages, or headings.
* Ensure every new string is translation-ready.

### Dark Mode

* Every component must fully support **Light** and **Dark** modes.
* Use the application's existing colour palette and theme tokens—do not introduce new colours unless necessary.
* Maintain a consistent design language across all pages, including:

  * Backgrounds
  * Cards
  * Tables
  * Forms
  * Modals
  * Buttons
  * Alerts
  * Dropdowns
  * Navigation
  * Typography
* Ensure spacing, shadows, borders, hover states, and focus states remain visually consistent in both themes.

### UI Consistency

* Follow a clean, modern, and professional admin dashboard design.
* Keep layouts responsive across desktop, tablet, and mobile devices.
* Use reusable form components, table components, and modal components wherever possible.
* Maintain consistent spacing, typography, iconography, and component behaviour throughout the application.
