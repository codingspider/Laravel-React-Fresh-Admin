<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class BranchScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $branchId = getBranchId();
        if ($branchId === null) {
            return;
        }

        $builder->where($model->qualifyColumn('branch_id'), $branchId);
    }
}
