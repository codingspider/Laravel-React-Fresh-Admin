<?php

namespace Modules\Notification\Repositories;

use Modules\Notification\Models\Notification;

class NotificationRepository
{
    public function __construct(protected Notification $model) {}

    /**
     * Paginated, user-scoped notification query for a restaurant.
     */
    public function paginateForUser(int $restaurantId, int $userId, array $filters = [], int $perPage = 15)
    {
        return $this->model->query()
            ->forRestaurant($restaurantId)
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', \App\Models\User::class)
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when(($filters['read'] ?? null) !== null, fn ($q) => $q->whereNotNull('read_at'))
            ->when(($filters['unread'] ?? null) !== null, fn ($q) => $q->whereNull('read_at'))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Unread count for a specific user within a restaurant.
     */
    public function unreadCountForUser(int $restaurantId, int $userId): int
    {
        return $this->model->query()
            ->forRestaurant($restaurantId)
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', \App\Models\User::class)
            ->unread()
            ->count();
    }

    /**
     * Mark every notification of a user within a restaurant as read.
     */
    public function markAllAsReadForUser(int $restaurantId, int $userId): int
    {
        return $this->model->query()
            ->forRestaurant($restaurantId)
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', \App\Models\User::class)
            ->unread()
            ->update(['read_at' => now()]);
    }

    /**
     * Delete all read notifications of a user within a restaurant.
     */
    public function clearReadForUser(int $restaurantId, int $userId): int
    {
        return $this->model->query()
            ->forRestaurant($restaurantId)
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', \App\Models\User::class)
            ->whereNotNull('read_at')
            ->delete();
    }
}
