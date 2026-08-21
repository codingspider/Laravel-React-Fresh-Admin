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

    /**
     * Keep only the ids that belong to the user's restaurant (all ids for super admins).
     *
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $model
     * @param  array<int, int>  $ids
     * @return array<int, int>
     */
    protected function filterOwnedIds(Request $request, string $model, array $ids): array
    {
        $restaurantId = $this->restaurantId($request);

        if (!$restaurantId || $ids === []) {
            return $ids;
        }

        return $model::where('restaurant_id', $restaurantId)
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();
    }

    /**
     * Resolve the tenant id for writes: scoped users always keep their own
     * restaurant, only unscoped users (super admins) may choose one.
     */
    protected function resolveTenantId(Request $request, ?string $requested = null): ?int
    {
        return $this->restaurantId($request) ?? $requested;
    }
}
