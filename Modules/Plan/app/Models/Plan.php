<?php

namespace Modules\Plan\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_cycle',
        'branch_limit',
        'user_limit',
        'invoice_limit',
        'is_active',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function packages()
    {
        return $this->belongsToMany(\Modules\Package\Models\Package::class, 'plan_package');
    }

    public function subscriptions()
    {
        return $this->hasMany(\Modules\Subscription\Models\Subscription::class);
    }

    public function isActive(): bool
    {
        return $this->is_active && $this->status === 'active';
    }
}
