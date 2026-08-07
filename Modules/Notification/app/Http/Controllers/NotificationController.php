<?php

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Models\Notification;
use Modules\Notification\Resources\NotificationResource;
use Modules\Notification\Services\NotificationService;

class NotificationController extends Controller
{
    protected string $langKey = 'notification::module';

    public function __construct(protected NotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['type', 'read', 'unread']);

        $data = $this->service->list(
            (int) getRestaurantId(),
            (int) $request->user()->id,
            $filters,
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => NotificationResource::collection($data),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->service->unreadCount(
            (int) getRestaurantId(),
            (int) $request->user()->id
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => ['unread_count' => $count],
        ]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $this->authorizeOwnership($request, $notification);

        $notification = $this->service->markAsRead($notification);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.marked_as_read'),
            'data' => new NotificationResource($notification),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $this->service->markAllAsRead(
            (int) getRestaurantId(),
            (int) $request->user()->id
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.all_marked_as_read'),
            'data' => ['updated' => $count],
        ]);
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        $this->authorizeOwnership($request, $notification);

        $this->service->destroy($notification);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function clearRead(Request $request): JsonResponse
    {
        $count = $this->service->clearRead(
            (int) getRestaurantId(),
            (int) $request->user()->id
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.cleared_read'),
            'data' => ['deleted' => $count],
        ]);
    }

    protected function authorizeOwnership(Request $request, Notification $notification): void
    {
        $restaurantId = (int) getRestaurantId();

        if ($restaurantId && $notification->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }

        if ($notification->notifiable_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}
