<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    /**
     * Paginated, filterable activity log list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = ActivityLog::query();

        $query->when(!empty($filters['restaurant_id']), function ($q) use ($filters) {
            $q->where(function ($sub) use ($filters) {
                $sub->where('restaurant_id', $filters['restaurant_id'])
                    ->orWhereNull('restaurant_id');
            });
        });

        $query->when(!empty($filters['action']), function ($q) use ($filters) {
            $q->where('action', $filters['action']);
        });

        $query->when(!empty($filters['method']), function ($q) use ($filters) {
            $q->where('method', $filters['method']);
        });

        $query->when(!empty($filters['status_code']), function ($q) use ($filters) {
            $q->where('response_status', $filters['status_code']);
        });

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $search = $filters['search'];
            $q->where(function ($query) use ($search) {
                $query->where('description', 'like', "%{$search}%")
                    ->orWhere('path', 'like', "%{$search}%")
                    ->orWhere('route_name', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    });
            });
        });

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->whereDate('created_at', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->whereDate('created_at', '<=', $filters['date_to']);
        });

        return $query->with(['user:id,name,email', 'branch:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
