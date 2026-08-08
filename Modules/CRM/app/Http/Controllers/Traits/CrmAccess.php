<?php

namespace Modules\CRM\Http\Controllers\Traits;

use Illuminate\Http\Request;

trait CrmAccess
{
    /**
     * Abort unless the authenticated user holds the given permission.
     */
    protected function authorizeAction(Request $request, string $permission): void
    {
        if (!$request->user()->can($permission)) {
            abort(403, 'Unauthorized');
        }
    }

    /**
     * Resolve the restaurant id for the current user (null for super admins).
     */
    protected function restaurantId(Request $request): ?int
    {
        $user = $request->user();

        return getRestaurantId($user);
    }

    /**
     * Abort unless the record belongs to the user's restaurant (when scoped).
     */
    protected function ensureOwned(?int $recordRestaurantId, ?int $userRestaurantId): void
    {
        if ($userRestaurantId && (int) $recordRestaurantId !== (int) $userRestaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
