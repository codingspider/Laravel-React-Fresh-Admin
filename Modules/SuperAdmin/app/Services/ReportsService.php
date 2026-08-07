<?php

namespace Modules\SuperAdmin\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Modules\Package\Models\Package;
use Modules\Plan\Models\Plan;
use Modules\Subscription\Models\Subscription;
use Modules\Restaurant\Models\Restaurant;

class ReportsService
{
    /**
     * Package report — aggregate packages with their plans count and usage.
     *
     * @return array<string, mixed>
     */
    public function packageReport(array $filters): array
    {
        $query = Package::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $packages = $query
            ->withCount('plans')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Package $pkg) => [
                'id' => $pkg->id,
                'name' => $pkg->name,
                'slug' => $pkg->slug,
                'description' => $pkg->description,
                'modules' => $pkg->modules,
                'status' => $pkg->status,
                'plans_count' => $pkg->plans_count,
                'created_at' => $pkg->created_at?->toISOString(),
                'updated_at' => $pkg->updated_at?->toISOString(),
            ]);

        $byStatus = $packages->groupBy('status')->map(fn ($group) => $group->count());

        return [
            'summary' => [
                'total_packages' => $packages->count(),
                'active_packages' => (int) ($byStatus['active'] ?? 0),
                'inactive_packages' => (int) ($byStatus['inactive'] ?? 0),
                'total_plans_associated' => $packages->sum('plans_count'),
            ],
            'by_status' => $byStatus->map(fn ($count, $status) => ['status' => $status, 'count' => $count])->values(),
            'rows' => $packages,
        ];
    }

    /**
     * Plan report — aggregate plans including their package associations and subscription usage.
     *
     * @return array<string, mixed>
     */
    public function planReport(array $filters): array
    {
        $query = Plan::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $plans = $query
            ->withCount('packages')
            ->withCount('subscriptions')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => (float) $plan->price,
                'billing_cycle' => $plan->billing_cycle,
                'branch_limit' => $plan->branch_limit,
                'user_limit' => $plan->user_limit,
                'invoice_limit' => $plan->invoice_limit,
                'trial_days' => $plan->trial_days ?? 0,
                'is_active' => (bool) $plan->is_active,
                'status' => $plan->status,
                'packages_count' => $plan->packages_count,
                'subscriptions_count' => $plan->subscriptions_count,
                'created_at' => $plan->created_at?->toISOString(),
                'updated_at' => $plan->updated_at?->toISOString(),
            ]);

        $byStatus = $plans->groupBy('status')->map(fn ($group) => $group->count());
        $byBillingCycle = $plans->groupBy('billing_cycle')->map(fn ($group) => $group->count());

        $totalRevenue = Subscription::whereIn('plan_id', $plans->pluck('id'))
            ->where('payment_status', 'paid')
            ->sum('payment_amount');

        return [
            'summary' => [
                'total_plans' => $plans->count(),
                'active_plans' => (int) ($byStatus['active'] ?? 0),
                'inactive_plans' => (int) ($byStatus['inactive'] ?? 0),
                'total_subscriptions' => $plans->sum('subscriptions_count'),
                'estimated_revenue' => round((float) $totalRevenue, 2),
            ],
            'by_status' => $byStatus->map(fn ($count, $status) => ['status' => $status, 'count' => $count])->values(),
            'by_billing_cycle' => $byBillingCycle->map(fn ($count, $cycle) => ['billing_cycle' => $cycle, 'count' => $count])->values(),
            'rows' => $plans,
        ];
    }

    /**
     * Subscription report — aggregate subscriptions across all restaurants.
     *
     * @return array<string, mixed>
     */
    public function subscriptionReport(array $filters): array
    {
        $now = Carbon::now();

        $query = Subscription::query()
            ->with(['restaurant:id,name,slug', 'plan:id,name']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }
        if (!empty($filters['is_trial'])) {
            $query->where('is_trial', $filters['is_trial']);
        }
        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->whereBetween('starts_at', [$filters['date_from'], $filters['date_to']]);
        }

        $subscriptions = $query
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Subscription $sub) => [
                'id' => $sub->id,
                'restaurant_id' => $sub->restaurant_id,
                'restaurant_name' => $sub->restaurant?->name ?? null,
                'restaurant_slug' => $sub->restaurant?->slug ?? null,
                'plan_id' => $sub->plan_id,
                'plan_name' => $sub->plan?->name ?? null,
                'starts_at' => $sub->starts_at?->toISOString(),
                'ends_at' => $sub->ends_at?->toISOString(),
                'trial_ends_at' => $sub->trial_ends_at?->toISOString(),
                'cancelled_at' => $sub->cancelled_at?->toISOString(),
                'is_trial' => (bool) $sub->is_trial,
                'payment_status' => $sub->payment_status,
                'payment_method' => $sub->payment_method,
                'payment_amount' => (float) $sub->payment_amount,
                'payment_reference' => $sub->payment_reference,
                'status' => $sub->status,
                'is_active' => $sub->isActive(),
                'is_expired' => $sub->isExpired(),
                'created_at' => $sub->created_at?->toISOString(),
            ]);

        $byStatus = $subscriptions->groupBy('status')->map(fn ($group) => $group->count());
        $byPaymentStatus = $subscriptions->groupBy('payment_status')->map(fn ($group) => $group->count());

        $totalRevenue = $subscriptions->where('payment_status', 'paid')->sum('payment_amount');
        $trialCount = $subscriptions->where('is_trial', true)->count();
        $activeCount = $subscriptions->where('is_active', true)->count();
        $expiredCount = $subscriptions->where('is_expired', true)->count();

        // Revenue by plan
        $revenueByPlan = $subscriptions
            ->where('payment_status', 'paid')
            ->groupBy('plan_id', 'plan_name')
            ->map(fn ($group) => [
                'plan_name' => $group->first()['plan_name'] ?? 'N/A',
                'total' => round($group->sum('payment_amount'), 2),
                'count' => $group->count(),
            ])
            ->values();

        return [
            'period' => [
                'date_from' => $filters['date_from'] ?? null,
                'date_to' => $filters['date_to'] ?? null,
            ],
            'summary' => [
                'total_subscriptions' => $subscriptions->count(),
                'active_subscriptions' => $activeCount,
                'trial_subscriptions' => $trialCount,
                'expired_subscriptions' => $expiredCount,
                'cancelled_subscriptions' => (int) ($byStatus['cancelled'] ?? 0),
                'total_revenue' => round((float) $totalRevenue, 2),
                'average_subscription_value' => $subscriptions->where('payment_status', 'paid')->count() > 0
                    ? round($totalRevenue / $subscriptions->where('payment_status', 'paid')->count(), 2)
                    : 0,
            ],
            'by_status' => $byStatus->map(fn ($count, $status) => ['status' => $status, 'count' => $count])->values(),
            'by_payment_status' => $byPaymentStatus->map(fn ($count, $status) => ['payment_status' => $status, 'count' => $count])->values(),
            'revenue_by_plan' => $revenueByPlan,
            'rows' => $subscriptions,
        ];
    }

    /**
     * Restaurant report — aggregate restaurants across the platform.
     *
     * @return array<string, mixed>
     */
    public function restaurantReport(array $filters): array
    {
        $query = Restaurant::query()
            ->with('owner:id,name,email');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $now = Carbon::now();

        $restaurants = $query
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Restaurant $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'slug' => $r->slug,
                'email' => $r->email,
                'phone' => $r->phone,
                'city' => $r->city,
                'country' => $r->country,
                'timezone' => $r->timezone,
                'currency' => $r->currency,
                'currency_symbol' => $r->currency_symbol,
                'status' => $r->status,
                'trial_ends_at' => $r->trial_ends_at?->toISOString(),
                'is_trial_active' => $r->trial_ends_at ? $r->trial_ends_at->isFuture() : false,
                'has_active_subscription' => $r->hasActiveSubscription(),
                'plan_name' => $r->subscription?->plan?->name ?? null,
                'owner_name' => $r->owner?->name ?? null,
                'owner_email' => $r->owner?->email ?? null,
                'created_at' => $r->created_at?->toISOString(),
                'updated_at' => $r->updated_at?->toISOString(),
                'created_at_human' => $r->created_at?->diffForHumans(),
            ]);

        $byStatus = $restaurants->groupBy('status')->map(fn ($group) => $group->count());

        $activeCount = $restaurants->where('status', 'active')->count();
        $trialActiveCount = $restaurants->where('is_trial_active', true)->count();
        $trialExpiredCount = $restaurants->where('is_trial_active', false)
            ->filter(fn ($r) => $r['trial_ends_at'] !== null)->count();
        $withActiveSubCount = $restaurants->where('has_active_subscription', true)->count();

        // Restaurants registration over time (monthly)
        $registrationTrend = $restaurants
            ->groupBy(fn ($r) => $r['created_at'] ? Carbon::parse($r['created_at'])->format('Y-m') : 'unknown')
            ->map(fn ($group) => [
                'month' => $group->keys()->first(),
                'count' => $group->count(),
            ])
            ->values()
            ->sortBy('month');

        return [
            'summary' => [
                'total_restaurants' => $restaurants->count(),
                'active_restaurants' => $activeCount,
                'inactive_restaurants' => (int) ($byStatus['inactive'] ?? 0),
                'suspended_restaurants' => (int) ($byStatus['suspended'] ?? 0),
                'trial_active' => $trialActiveCount,
                'trial_expired' => $trialExpiredCount,
                'with_active_subscription' => $withActiveSubCount,
                'without_active_subscription' => $restaurants->where('has_active_subscription', false)->count(),
            ],
            'by_status' => $byStatus->map(fn ($count, $status) => ['status' => $status, 'count' => $count])->values(),
            'registration_trend' => $registrationTrend,
            'rows' => $restaurants,
        ];
    }

    /**
     * Unified platform overview — combined summary across packages, plans, subscriptions and restaurants.
     *
     * @return array<string, mixed>
     */
    public function platformOverview(): array
    {
        $now = Carbon::now();

        $totalRestaurants = Restaurant::count();
        $activeRestaurants = Restaurant::where('status', 'active')->count();

        $totalPackages = Package::count();
        $activePackages = Package::where('status', 'active')->count();

        $totalPlans = Plan::count();
        $activePlans = Plan::where('status', 'active')->where('is_active', true)->count();

        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'active')
            ->where(function ($q) use ($now) {
                $q->where(fn ($q2) => $q2->where('is_trial', false)->where('ends_at', '>', $now))
                  ->orWhere(fn ($q2) => $q2->where('is_trial', true)->where('trial_ends_at', '>', $now));
            })
            ->count();

        $trialSubscriptions = Subscription::where('is_trial', true)->count();
        $revenue = Subscription::where('payment_status', 'paid')->sum('payment_amount');

        // Revenue trend (monthly)
        $revenueTrend = Subscription::where('payment_status', 'paid')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(payment_amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'total' => (float) $row->total,
            ])
            ->values();

        return [
            'platform_stats' => [
                'total_restaurants' => $totalRestaurants,
                'active_restaurants' => $activeRestaurants,
                'total_packages' => $totalPackages,
                'active_packages' => $activePackages,
                'total_plans' => $totalPlans,
                'active_plans' => $activePlans,
                'total_subscriptions' => $totalSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'trial_subscriptions' => $trialSubscriptions,
                'total_revenue' => round((float) $revenue, 2),
            ],
            'revenue_trend' => $revenueTrend,
        ];
    }
}
