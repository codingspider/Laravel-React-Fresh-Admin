<?php

namespace Modules\SuperAdmin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\POS\Models\Sale;
use Modules\POS\Models\SaleItem;
use Modules\POS\Models\Payment;
use Modules\Menu\Models\MenuItem;
use Modules\Menu\Models\MenuCategory;
use Modules\Accounting\Models\Expense;
use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use Carbon\Carbon;
use Modules\Restaurant\Models\Restaurant;
use Modules\Plan\Models\Plan;
use Modules\Subscription\Models\Subscription;

class DashboardController extends Controller
{
    /**
     * Platform-wide dashboard for super admins.
     * Aggregates restaurants, plans and subscriptions across all businesses.
     */
    public function platformStats(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans('superadmin::module.forbidden'),
            ], 403);
        }

        $now = Carbon::now();

        $totalRestaurants = Restaurant::count();
        $activeRestaurants = Restaurant::where('status', 'active')->count();
        $totalPlans = Plan::count();
        $activePlans = Plan::where('status', 'active')->where('is_active', true)->count();

        $subscriptions = Subscription::query();
        $totalSubscriptions = (clone $subscriptions)->count();
        $activeSubscriptions = (clone $subscriptions)->where('status', 'active')
            ->where(function ($q) use ($now) {
                $q->where(fn ($q2) => $q2->where('is_trial', false)->where('ends_at', '>', $now))
                  ->orWhere(fn ($q2) => $q2->where('is_trial', true)->where('trial_ends_at', '>', $now));
            })
            ->count();
        $trialSubscriptions = (clone $subscriptions)->where('is_trial', true)->count();
        $expiredSubscriptions = (clone $subscriptions)
            ->where(function ($q) use ($now) {
                $q->where(fn ($q2) => $q2->where('is_trial', false)->where(function ($q3) use ($now) {
                    $q3->whereNull('ends_at')->orWhere('ends_at', '<=', $now);
                }))
                ->orWhere(fn ($q2) => $q2->where('is_trial', true)->where(function ($q3) use ($now) {
                    $q3->whereNull('trial_ends_at')->orWhere('trial_ends_at', '<=', $now);
                }));
            })
            ->count();
        $subscriptionRevenue = (clone $subscriptions)->where('payment_status', 'paid')->sum('payment_amount');

        $recentRestaurants = Restaurant::with('owner:id,name,email')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'logo' => $r->logo,
                'status' => $r->status,
                'owner_name' => $r->owner->name ?? null,
                'created_at' => $r->created_at?->toISOString(),
            ]);

        $recentSubscriptions = Subscription::with(['restaurant:id,name,slug', 'plan:id,name'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'restaurant_name' => $s->restaurant->name ?? null,
                'plan_name' => $s->plan->name ?? null,
                'status' => $s->status,
                'is_trial' => $s->is_trial ?? false,
                'starts_at' => $s->starts_at?->toISOString(),
                'ends_at' => $s->ends_at?->toISOString(),
                'created_at' => $s->created_at?->toISOString(),
            ]);

        $planDistribution = Subscription::with('plan:id,name')
            ->select('plan_id', DB::raw('COUNT(*) as total'))
            ->groupBy('plan_id')
            ->get()
            ->map(fn ($row) => [
                'plan_name' => $row->plan->name ?? 'N/A',
                'total' => (int) $row->total,
            ]);

        $statusDistribution = Subscription::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status ?: 'unknown',
                'total' => (int) $row->total,
            ]);

        return response()->json([
            'status' => 'success',
            'message' => trans('superadmin::module.platform_stats_fetched'),
            'data' => [
                'stats' => [
                    'total_restaurants' => $totalRestaurants,
                    'active_restaurants' => $activeRestaurants,
                    'total_plans' => $totalPlans,
                    'active_plans' => $activePlans,
                    'total_subscriptions' => $totalSubscriptions,
                    'active_subscriptions' => $activeSubscriptions,
                    'trial_subscriptions' => $trialSubscriptions,
                    'expired_subscriptions' => $expiredSubscriptions,
                    'subscription_revenue' => round((float) $subscriptionRevenue, 2),
                ],
                'recent_restaurants' => $recentRestaurants,
                'recent_subscriptions' => $recentSubscriptions,
                'plan_distribution' => $planDistribution,
                'status_distribution' => $statusDistribution,
            ],
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();

        $now = Carbon::now();
        $startOfDay = $now->copy()->startOfDay();
        $endOfDay = $now->copy()->endOfDay();

        // ── Stats Cards ──
        $totalSales = Sale::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $totalOrders = Sale::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->count();

        $activeOrders = Sale::where('restaurant_id', $restaurantId)
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])
            ->count();

        $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        $totalUsers = \App\Models\User::where('restaurant_id', $restaurantId)->count();
        $totalMenus = MenuCategory::where('restaurant_id', $restaurantId)->count();
        $totalProducts = MenuItem::where('restaurant_id', $restaurantId)->count();
        $totalCategories = InventoryCategory::where('restaurant_id', $restaurantId)->count();

        // ── Hourly Sales Trend (today) ──
        $hourlySales = Sale::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('HOUR(created_at) as hour, SUM(total) as total')
            ->groupBy('hour')
            ->pluck('total', 'hour')
            ->toArray();

        $hourlySalesTrend = collect(range(0, 23))->map(function ($hour) use ($hourlySales) {
            $displayHour = $hour === 0 ? 12 : ($hour > 12 ? $hour - 12 : $hour);
            $period = $hour < 12 ? 'AM' : 'PM';
            return [
                'hour' => sprintf('%d:00 %s', $displayHour, $period),
                'total' => round($hourlySales[$hour] ?? 0, 2),
            ];
        })->toArray();

        // ── Sales Analytics (weekly) ──
        $weeklySales = Sale::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->selectRaw('DAYOFWEEK(created_at) as day_of_week, SUM(total) as total')
            ->groupBy('day_of_week')
            ->pluck('total', 'day_of_week')
            ->toArray();

        $dayMap = [1 => 'Sunday', 2 => 'Monday', 3 => 'Tuesday', 4 => 'Wednesday', 5 => 'Thursday', 6 => 'Friday', 7 => 'Saturday'];
        $salesAnalytics = collect($dayMap)->map(function ($day, $key) use ($weeklySales) {
            return [
                'day' => $day,
                'total' => round($weeklySales[$key] ?? 0, 2),
            ];
        })->values()->toArray();

        // ── Top Selling Products ──
        $topProducts = SaleItem::whereHas('sale', function ($q) use ($restaurantId) {
                $q->where('restaurant_id', $restaurantId)->where('status', '!=', 'cancelled');
            })
            ->select('menu_item_id', DB::raw('SUM(quantity) as quantity_sold'), DB::raw('SUM(total) as total_amount'))
            ->groupBy('menu_item_id')
            ->orderByDesc('total_amount')
            ->limit(5)
            ->with('menuItem:id,name,image,price')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->menu_item_id,
                    'name' => $item->menuItem->name ?? 'N/A',
                    'image' => $item->menuItem->image ?? null,
                    'quantity_sold' => $item->quantity_sold,
                    'total_amount' => round($item->total_amount, 2),
                ];
            });

        // ── Branch Wise Sales ──
        $branchSales = Sale::where('sales.restaurant_id', $restaurantId)
            ->where('sales.status', '!=', 'cancelled')
            ->whereNotNull('sales.branch_id')
            ->join('branches', 'sales.branch_id', '=', 'branches.id')
            ->select('sales.branch_id', 'branches.name as branch_name', DB::raw('SUM(sales.total) as total_sales'), DB::raw('COUNT(*) as total_orders'))
            ->groupBy('sales.branch_id', 'branches.name')
            ->orderByDesc('total_sales')
            ->get()
            ->map(function ($item) {
                return [
                    'branch_id' => $item->branch_id,
                    'branch_name' => $item->branch_name,
                    'total_sales' => round($item->total_sales, 2),
                    'total_orders' => $item->total_orders,
                ];
            });

        // ── Best Performing Branches ──
        $bestBranches = $branchSales->take(5);

        // ── Order Type Distribution ──
        $orderTypeDistribution = Sale::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->select('order_type', DB::raw('COUNT(*) as count'))
            ->groupBy('order_type')
            ->pluck('count', 'order_type')
            ->map(function ($count, $type) {
                return ['type' => ucfirst($type), 'count' => $count];
            })
            ->values()
            ->toArray();

        // ── Order Status Distribution ──
        $orderStatusDistribution = Sale::where('restaurant_id', $restaurantId)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(function ($count, $status) {
                return ['status' => ucfirst($status), 'count' => $count];
            })
            ->values()
            ->toArray();

        // ── Low Stock Alerts ──
        $lowStockItems = InventoryItem::where('restaurant_id', $restaurantId)
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->where('current_stock', '>', 0)
            ->orderBy('current_stock')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'current_stock' => $item->current_stock,
                    'reorder_level' => $item->minimum_stock,
                    'unit' => $item->unit ?? 'N/A',
                ];
            });

        // ── Cash Movements (today) ──
        $cashIn = Sale::where('restaurant_id', $restaurantId)
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->sum('total');

        $cashOut = Expense::where('restaurant_id', $restaurantId)
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->sum('amount');

        // ── Payments Overview (all time) ──
        $paymentMethods = Payment::whereHas('sale', function ($q) use ($restaurantId) {
                $q->where('restaurant_id', $restaurantId)
                  ->where('status', '!=', 'cancelled');
            })
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method')
            ->toArray();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_sales' => round($totalSales, 2),
                    'total_orders' => $totalOrders,
                    'active_orders' => $activeOrders,
                    'average_order_value' => round($averageOrderValue, 2),
                    'total_users' => $totalUsers,
                    'total_menus' => $totalMenus,
                    'total_products' => $totalProducts,
                    'total_categories' => $totalCategories,
                ],
                'hourly_sales_trend' => $hourlySalesTrend,
                'sales_analytics' => $salesAnalytics,
                'top_selling_products' => $topProducts,
                'branch_sales_comparison' => $branchSales,
                'best_performing_branches' => $bestBranches,
                'order_type_distribution' => $orderTypeDistribution,
                'order_status_distribution' => $orderStatusDistribution,
                'low_stock_alerts' => $lowStockItems,
                'cash_movements' => [
                    'in' => round($cashIn, 2),
                    'out' => round($cashOut, 2),
                    'adjust' => 0,
                ],
                'payments_overview' => $paymentMethods,
            ],
        ]);
    }
}
