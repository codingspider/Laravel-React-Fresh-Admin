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
    public function summary(int $restaurantId): array
    {
        $now = now();

        $birthdayWindow = $this->upcomingRecurringDateRange($now, 30);

        return [
            'total_customers' => (int) Customer::where('restaurant_id', $restaurantId)->count(),
            'new_customers_this_month' => (int) Customer::where('restaurant_id', $restaurantId)
                ->where('created_at', '>=', $now->copy()->startOfMonth())
                ->count(),
            'active_customers' => (int) Customer::where('restaurant_id', $restaurantId)
                ->where('is_active', true)
                ->count(),
            'total_spent' => (float) Customer::where('restaurant_id', $restaurantId)->sum('total_spent'),
            'pending_follow_ups' => (int) FollowUp::where('restaurant_id', $restaurantId)
                ->where('status', 'pending')
                ->count(),
            'upcoming_birthdays' => $this->upcomingCustomers($restaurantId, 'dob', $birthdayWindow['start'], $birthdayWindow['end'], $now),
            'upcoming_anniversaries' => $this->upcomingCustomers($restaurantId, 'anniversary', $birthdayWindow['start'], $birthdayWindow['end'], $now),
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
            'recent_customers' => Customer::where('restaurant_id', $restaurantId)
                ->with('segments:id,name,color')
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
    protected function upcomingCustomers(int $restaurantId, string $column, string $start, string $end, Carbon $now): array
    {
        $customers = Customer::where('restaurant_id', $restaurantId)
            ->whereNotNull($column)
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
