# Development Guidelines & Coding Standards

The project must be developed with a strong focus on **clean architecture, maintainability, scalability, performance, and CodeCanyon compatibility**. Every implementation should follow Laravel and React best practices while ensuring the codebase remains easy to understand, extend, and maintain.

## General Coding Standards

* Follow **PSR-12** coding standards throughout the project.
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

Implement:

* Roles
* Permissions

Every protected action should be permission-based.

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
