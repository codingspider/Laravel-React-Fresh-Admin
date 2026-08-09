<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class CheckPermission
{
    /**
     * Map normalized route paths to permission entities.
     *
     * Standard resources map to "{action}_{entity}" where the action is
     * derived from the HTTP method (GET=view, POST=create, PUT/PATCH=update,
     * DELETE=delete). Routes that are not present here are not permission-gated.
     *
     * @var array<string, string|array<string, string>>
     */
    protected array $entities = [
        'branches' => 'branches',
        'restaurants' => 'restaurants',
        'menu/categories' => 'menu_categories',
        'menu/items' => 'menu_items',
        'menu/modifier-groups' => 'modifier_groups',
        'categories' => 'categories',
        'units' => 'units',
        'inventory' => 'inventory',
        'inventory-items' => 'inventory',
        'inventory-categories' => 'inventory',
        'suppliers' => 'suppliers',
        'customers' => 'customers',
        'currencies' => 'currencies',
        'packages' => 'packages',
        'plans' => 'plans',
        'subscriptions' => 'subscriptions',
        'tables' => 'tables',
        'floors' => 'floors',
        'reservations' => 'reservations',
        'recipes' => 'recipes',
        'purchases' => 'purchases',
        'accounts' => 'accounts',
        'income' => 'income',
        'expenses' => 'expenses',
        'expense-categories' => 'expense_categories',
        'cash-bank' => 'cash_bank',
        'journal' => 'journal_entries',
        'employees' => 'employees',
        'departments' => 'departments',
        'designations' => 'designations',
        'attendance' => 'attendance',
        'leaves' => 'leave_requests',
        'holidays' => 'holidays',
        'payrolls' => 'payrolls',
        'segments' => 'segments',
        'follow-ups' => 'follow_ups',
        'orderss' => 'orders',
        'user-management' => 'user',
        'dashboard' => 'dashboard',
        'dashboard/stats' => 'dashboard',
        'dashboard/platform-stats' => 'dashboard',
        'activity-logs' => 'activity_logs',
        'backups' => 'backups',
        'roles' => [
            'view' => 'role_list',
            'create' => 'role_create',
            'update' => 'role_edit',
            'delete' => 'role_delete',
        ],
        'notifications' => [
            'view' => 'view_notifications',
            'delete' => 'delete_notifications',
        ],
        'pos' => [
            'view' => 'view_pos',
            'create' => 'process_sale',
            'update' => 'process_sale',
            'delete' => 'process_sale',
        ],
        'pos/settings' => [
            'view' => 'view_pos',
            'update' => 'view_pos',
        ],
        'pos/coupons' => [
            'view' => 'view_pos',
            'create' => 'view_pos',
            'update' => 'view_pos',
            'delete' => 'view_pos',
        ],
        'kitchen/display' => [
            'view' => 'view_kitchen_display',
            'create' => 'manage_kitchen_orders',
            'update' => 'manage_kitchen_orders',
            'delete' => 'manage_kitchen_orders',
        ],
        'kitchen/chefs' => 'view_kitchen_display',
        'kitchen/orders' => [
            'view' => 'view_kitchen_display',
            'create' => 'manage_kitchen_orders',
            'update' => 'manage_kitchen_orders',
            'delete' => 'manage_kitchen_orders',
        ],
        'deliverys' => [
            'view' => 'view_deliveries',
            'create' => 'manage_deliveries',
            'update' => 'manage_deliveries',
            'delete' => 'manage_deliveries',
        ],
        'customer-display' => [
            'view' => 'view_customer_display',
            'create' => 'manage_customer_display',
            'update' => 'manage_customer_display',
            'delete' => 'manage_customer_display',
        ],
        'customer-display/settings' => [
            'view' => 'view_customer_display',
            'create' => 'manage_customer_display',
            'update' => 'manage_customer_display',
            'delete' => 'manage_customer_display',
        ],
        'loyalty/settings' => [
            'view' => 'view_loyalty_settings',
            'create' => 'update_loyalty_settings',
            'update' => 'update_loyalty_settings',
        ],
        'loyalty/customers' => 'view_loyalty_customers',
        'loyalty/transactions' => 'view_loyalty_transactions',
        'reports/sales' => 'view_sale_report',
        'reports/purchases' => 'view_purchase_report',
        'reports/taxes' => 'view_tax_report',
        'reports/expenses' => 'view_expense_report',
        'reports' => 'view_reports',
    ];

    protected const ACTIONS = [
        'GET' => 'view',
        'HEAD' => 'view',
        'POST' => 'create',
        'PUT' => 'update',
        'PATCH' => 'update',
        'DELETE' => 'delete',
    ];

    /**
     * @var array<int, string>|null
     */
    protected ?array $knownPermissions = null;

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || isSuperAdmin($user)) {
            return $next($request);
        }

        $permission = $this->resolvePermission($request);
        if ($permission === null) {
            return $next($request);
        }

        if (!$user->can($permission)) {
            return response()->json([
                'status' => 'error',
                'code' => 'permission_denied',
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        return $next($request);
    }

    protected function resolvePermission(Request $request): ?string
    {
        $action = self::ACTIONS[$request->method()] ?? null;
        if ($action === null) {
            return null;
        }

        $path = $this->normalizePath($request);
        if ($path === null) {
            return null;
        }

        $resolved = null;
        $segments = explode('/', $path);

        while ($resolved === null && count($segments) > 0) {
            $key = implode('/', $segments);
            if (isset($this->entities[$key])) {
                $resolved = $this->entities[$key];
                break;
            }
            array_pop($segments);
        }

        if ($resolved === null) {
            return null;
        }

        if (is_array($resolved)) {
            $permission = $resolved[$action] ?? null;
        } else {
            $permission = "{$action}_{$resolved}";
        }

        if ($permission === null || !$this->permissionExists($permission)) {
            return null;
        }

        return $permission;
    }

    /**
     * Strip the api/v1 prefixes and route parameters from the request URI.
     */
    protected function normalizePath(Request $request): ?string
    {
        $uri = $request->route()?->uri();
        if ($uri === null) {
            return null;
        }

        $uri = preg_replace('/\{[^}]+\}/', '', $uri) ?? '';
        $uri = trim($uri, '/');

        $segments = array_values(array_filter(explode('/', $uri), fn ($s) => $s !== ''));

        while ($segments && in_array($segments[0], ['api', 'v1'], true)) {
            array_shift($segments);
        }

        return count($segments) > 0 ? implode('/', $segments) : null;
    }

    protected function permissionExists(string $permission): bool
    {
        if ($this->knownPermissions === null) {
            $this->knownPermissions = Permission::pluck('name')->all();
        }

        return in_array($permission, $this->knownPermissions, true);
    }
}
