<?php

namespace App\Models\Concerns;

use App\Models\Scopes\BranchScope;

/**
 * Automatically scopes a model to the authenticated user's branch.
 *
 * - Only applied when the authenticated user is assigned to a specific branch
 *   (branch manager, cashier, waiter, etc.). Restaurant owners and super admins
 *   are not branch-scoped and see all branches.
 * - Populates the branch_id attribute automatically when creating new records
 *   if it was not explicitly provided.
 */
trait BranchScoped
{
    public static function bootBranchScoped(): void
    {
        static::addGlobalScope(new BranchScope());

        static::creating(function ($model) {
            if (!empty($model->getAttribute('branch_id'))) {
                return;
            }

            $branchId = getBranchId();

            if ($branchId === null && !empty($model->getAttribute('restaurant_id'))) {
                $branchId = \Modules\Branch\Models\Branch::where('restaurant_id', $model->restaurant_id)
                    ->where('is_main', true)
                    ->value('id');
            }

            if ($branchId !== null) {
                $model->setAttribute('branch_id', $branchId);
            }
        });
    }
}
