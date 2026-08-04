# Persistent Development Instructions (Apply to Every Task)

These are permanent project standards. Apply them automatically to every new feature, module, page, CRUD operation, or bug fix unless I explicitly instruct otherwise.

## General Development Rules

* Follow the existing project architecture.
* Follow the project's **Modules pattern**.
* Follow the existing **API routes pattern**.
* Follow the project's coding standards and naming conventions.
* Write clean, maintainable, PSR-compliant code.

## UI & Layout

* Every page must fully support both **Light Mode** and **Dark Mode**.
* Use the existing theme and reusable components.
* All user-facing text must use the translation helper:

  ```jsx
  t('Your Text')
  ```

  Never hardcode display text.

## CRUD Standard

For every new module, the **List, Create, and Edit pages must follow the exact same design, layout, user experience, functionality, validation, and coding pattern used by the existing Branch module's List, Create, and Edit pages.**

This means:

* Match the same page structure.
* Match the same component organization.
* Match the same form layout.
* Match the same table style.
* Match the same search, filters, pagination, and actions.
* Follow the same React component pattern.
* Reuse existing components whenever possible.

**Do not recreate or modify the Branch module. Use it only as the implementation reference for all future CRUD pages.**

## Sidebar

Whenever a new module is added:

* Add the corresponding Admin Sidebar menu.
* Follow the existing sidebar structure.
* Use proper icons and active menu highlighting.

## Permissions

For every new module:

* Create all required permissions.
* Add them to the Permission Seeder.
* Automatically assign them to the **Restaurant Owner** role.
* Follow the existing permission naming convention.

## API

* Follow the existing REST API pattern.
* Use the project's standard JSON response format.
* Apply validation and exception handling.
* Keep responses consistent across all endpoints.

## Database

* Create proper migrations.
* Use foreign keys where appropriate.
* Follow the existing database naming conventions.

## Code Quality

* Reuse existing helpers and components.
* Avoid duplicate code.
* Follow SOLID principles.
* Keep implementations consistent with the rest of the project.

## Final Checklist

Before marking any task as complete, verify that:

* ✅ List page follows the Branch List page pattern.
* ✅ Create page follows the Branch Create page pattern.
* ✅ Edit page follows the Branch Edit page pattern.
* ✅ Dark Mode is fully supported.
* ✅ All text uses `t()`.
* ✅ API follows the existing project pattern.
* ✅ Module follows the existing architecture.
* ✅ Admin Sidebar menu is added.
* ✅ Permissions are created.
* ✅ Permission Seeder is updated.
* ✅ Permissions are assigned to the Restaurant Owner role.
* ✅ Code is clean, optimized, consistent, and production-ready.

**These instructions are permanent and must be applied automatically to every future development task unless I explicitly override them.**
