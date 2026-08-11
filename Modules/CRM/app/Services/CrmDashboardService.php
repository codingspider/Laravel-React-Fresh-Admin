<?php

namespace Modules\CRM\Services;

use Illuminate\Support\Carbon;
use Modules\CRM\Models\FollowUp;
use Modules\CRM\Models\Segment;
use Modules\Customer\Models\Customer;

class CrmDashboardService
{
    /**
     * CRM dashboard summary for a restaurant.
     *
     * @return array<string, mixed>
     */
    public function summary(int $restaurantId, array $filters = []): array
    {
        $now = now();
        $branchId = $filters['branch_id'] ?? null;
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        $birthdayWindow = $this->upcomingRecurringDateRange($now, 30);

        $branchFilter = function ($q) use ($branchId) {
            if ($branchId) {
                $q->where('branch_id', $branchId);
            }
        };

        $dateFilter = function ($q) use ($dateFrom, $dateTo) {
            if ($dateFrom && $dateTo) {
                $q->whereBetween('created_at', [\Carbon\Carbon::parse($dateFrom)->startOfDay(), \Carbon\Carbon::parse($dateTo)->endOfDay()]);
            } elseif ($dateFrom) {
                $q->where('created_at', '>=', \Carbon\Carbon::parse($dateFrom)->startOfDay());
            } elseif ($dateTo) {
                $q->where('created_at', '<=', \Carbon\Carbon::parse($dateTo)->endOfDay());
            }
        };

        $totalCustomers = Customer::where('restaurant_id', $restaurantId)
            ->tap($branchFilter)
            ->when($dateFrom || $dateTo, $dateFilter)
            ->count();

        $newCustomersQuery = Customer::where('restaurant_id', $restaurantId)
            ->tap($branchFilter);

        if ($dateFrom || $dateTo) {
            $newCustomersQuery->when($dateFrom || $dateTo, $dateFilter);
        } else {
            $newCustomersQuery->where('created_at', '>=', $now->copy()->startOfMonth());
        }

        $activeCustomers = Customer::where('restaurant_id', $restaurantId)
            ->tap($branchFilter)
            ->where('is_active', true)
            ->count();

        $totalSpent = Customer::where('restaurant_id', $restaurantId)
            ->tap($branchFilter)
            ->when($dateFrom || $dateTo, $dateFilter)
            ->sum('total_spent');

        $pendingFollowUps = FollowUp::where('restaurant_id', $restaurantId)
            ->tap($branchFilter)
            ->where('status', 'pending')
            ->when($dateFrom || $dateTo, function ($q) use ($dateFrom, $dateTo) {
                if ($dateFrom && $dateTo) {
                    $q->whereBetween('due_at', [\Carbon\Carbon::parse($dateFrom)->startOfDay(), \Carbon\Carbon::parse($dateTo)->endOfDay()]);
                } elseif ($dateFrom) {
                    $q->where('due_at', '>=', \Carbon\Carbon::parse($dateFrom)->startOfDay());
                } elseif ($dateTo) {
                    $q->where('due_at', '<=', \Carbon\Carbon::parse($dateTo)->endOfDay());
                }
            })
            ->count();

        $recentCustomersQuery = Customer::where('restaurant_id', $restaurantId)
            ->tap($branchFilter)
            ->with('segments:id,name,color');

        if ($dateFrom || $dateTo) {
            $recentCustomersQuery->when($dateFrom || $dateTo, $dateFilter);
        }

        return [
            'total_customers' => (int) $totalCustomers,
            'new_customers_this_month' => (int) $newCustomersQuery->count(),
            'active_customers' => (int) $activeCustomers,
            'total_spent' => (float) $totalSpent,
            'pending_follow_ups' => (int) $pendingFollowUps,
            'upcoming_birthdays' => $this->upcomingCustomers($restaurantId, 'dob', $birthdayWindow['start'], $birthdayWindow['end'], $now, $branchId),
            'upcoming_anniversaries' => $this->upcomingCustomers($restaurantId, 'anniversary', $birthdayWindow['start'], $birthdayWindow['end'], $now, $branchId),
            'segment_breakdown' => Segment::where('restaurant_id', $restaurantId)
                ->withCount('customers')
                ->orderBy('name')
                ->get(['id', 'name', 'color'])
                ->map(fn ($segment) => [
                    'id' => $segment->id,
                    'name' => $segment->name,
                    'color' => $segment->color,
                    'customers_count' => $segment->customers_count,
                ])
                ->values()
                ->toArray(),
            'recent_customers' => $recentCustomersQuery
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'name', 'phone', 'email', 'total_spent', 'created_at'])
                ->toArray(),
        ];
    }

    /**
     * Build a recurring (birthday/anniversary) date range window for the next N days.
     *
     * @return array{start: string, end: string}
     */
    protected function upcomingRecurringDateRange(Carbon $now, int $days): array
    {
        return [
            'start' => $now->copy()->format('m-d'),
            'end' => $now->copy()->addDays($days)->format('m-d'),
        ];
    }

    /**
     * Customers whose recurring date (dob/anniversary) falls inside a window.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function upcomingCustomers(int $restaurantId, string $column, string $start, string $end, Carbon $now, ?int $branchId = null): array
    {
        $customers = Customer::where('restaurant_id', $restaurantId)
            ->whereNotNull($column)
            ->when($branchId, fn($q, $b) => $q->where('branch_id', $b))
            ->get(['id', 'name', 'phone', $column]);

        return $customers
            ->filter(function ($customer) use ($column, $start, $end) {
                $md = $customer->{$column}->format('m-d');

                // Handles year boundaries (e.g. Dec -> Jan).
                return $start <= $end
                    ? $md >= $start && $md <= $end
                    : $md >= $start || $md <= $end;
            })
            ->map(function ($customer) use ($column, $now) {
                $nextDate = $customer->{$column}->copy()->setYear($now->year);
                if ($nextDate->lessThan($now)) {
                    $nextDate->addYear();
                }

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'date' => $nextDate->toISOString(),
                    'days_until' => (int) $now->diffInDays($nextDate),
                ];
            })
            ->sortBy('days_until')
            ->values()
            ->take(10)
            ->all();
    }
}
