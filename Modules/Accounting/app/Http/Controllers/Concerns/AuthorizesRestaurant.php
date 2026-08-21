<?php

namespace Modules\Accounting\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Modules\Accounting\Models\Account;

trait AuthorizesRestaurant
{
    /**
     * Abort unless the record belongs to the user's restaurant (when scoped).
     */
    protected function authorizeOwned(Request $request, ?int $recordRestaurantId): void
    {
        $restaurantId = getRestaurantId($request->user());

        if ($restaurantId && (int) $recordRestaurantId !== (int) $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }

    /**
     * Reject any referenced account that is not owned by the user's restaurant.
     */
    protected function authorizeAccounts(Request $request, int|string|null ...$accountIds): void
    {
        $restaurantId = getRestaurantId($request->user());

        if (!$restaurantId) {
            return;
        }

        $ids = array_values(array_filter(array_map('intval', $accountIds)));

        if ($ids === []) {
            return;
        }

        $foreign = Account::whereIn('id', $ids)
            ->where('restaurant_id', '!=', $restaurantId)
            ->exists();

        if ($foreign) {
            throw ValidationException::withMessages([
                'account_id' => trans('accounting::module.account_mismatch'),
            ]);
        }
    }
}