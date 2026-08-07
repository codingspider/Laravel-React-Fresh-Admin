<?php

namespace Modules\Notification\Services;

use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Modules\Notification\Models\Notification;
use Modules\Notification\Notifications\LowStockNotification;
use Modules\Notification\Notifications\NewOrderNotification;
use Modules\Notification\Notifications\OrderRefundedNotification;
use Modules\Notification\Repositories\NotificationRepository;
use Modules\POS\Models\Sale;
use Modules\Restaurant\Models\Restaurant;

class NotificationService
{
    public function __construct(protected NotificationRepository $repository) {}

    /**
     * Paginated notification list for a restaurant, scoped to the current user.
     */
    public function list(int $restaurantId, int $userId, array $filters = [], int $perPage = 15)
    {
        return $this->repository->paginateForUser($restaurantId, $userId, $filters, $perPage);
    }

    /**
     * Unread notification count for the current user.
     */
    public function unreadCount(int $restaurantId, int $userId): int
    {
        return $this->repository->unreadCountForUser($restaurantId, $userId);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Notification $notification): Notification
    {
        if (!$notification->read_at) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        return $notification->fresh();
    }

    /**
     * Mark all notifications of the current user as read.
     */
    public function markAllAsRead(int $restaurantId, int $userId): int
    {
        return $this->repository->markAllAsReadForUser($restaurantId, $userId);
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Notification $notification): bool
    {
        return (bool) $notification->delete();
    }

    /**
     * Delete all read notifications of the current user.
     */
    public function clearRead(int $restaurantId, int $userId): int
    {
        return $this->repository->clearReadForUser($restaurantId, $userId);
    }

    /**
     * Notify all restaurant users holding a permission about a completed sale.
     */
    public function notifySaleCompleted(Sale $sale): void
    {
        $userIds = $this->targetUserIds($sale->restaurant_id, 'view_orders');

        if (empty($userIds)) {
            return;
        }

        NotificationFacade::send(
            User::whereIn('id', $userIds)->get(),
            new NewOrderNotification($sale)
        );
    }

    /**
     * Notify all restaurant users holding a permission about a refunded sale.
     */
    public function notifySaleRefunded(Sale $sale, array $refundData): void
    {
        $userIds = $this->targetUserIds($sale->restaurant_id, 'view_orders');

        if (empty($userIds)) {
            return;
        }

        NotificationFacade::send(
            User::whereIn('id', $userIds)->get(),
            new OrderRefundedNotification($sale, $refundData)
        );
    }

    /**
     * Notify all restaurant users holding a permission about a low stock item.
     */
    public function notifyLowStock(InventoryItem $item, float $currentStock, ?int $restaurantId): void
    {
        $restaurantId = $restaurantId ?? $item->restaurant_id;
        if (!$restaurantId) {
            return;
        }

        $userIds = $this->targetUserIds($restaurantId, 'view_inventory');

        if (empty($userIds)) {
            return;
        }

        NotificationFacade::send(
            User::whereIn('id', $userIds)->get(),
            new LowStockNotification($item, $currentStock)
        );
    }

    /**
     * Resolve the user ids belonging to a restaurant and holding a permission.
     *
     * @return array<int>
     */
    protected function targetUserIds(?int $restaurantId, string $permission): array
    {
        if (!$restaurantId) {
            return [];
        }

        $ownerIds = Restaurant::where('id', $restaurantId)->pluck('owner_id');

        return User::permission($permission)
            ->where(function ($query) use ($restaurantId, $ownerIds) {
                $query->where('restaurant_id', $restaurantId)
                    ->orWhereIn('id', $ownerIds);
            })
            ->pluck('id')
            ->all();
    }
}
