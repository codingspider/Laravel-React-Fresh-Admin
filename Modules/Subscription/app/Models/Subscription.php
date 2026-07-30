<?php

namespace Modules\Subscription\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'plan_id',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'is_trial',
        'cancelled_at',
        'payment_status',
        'payment_method',
        'payment_amount',
        'payment_date',
        'payment_reference',
        'notes',
        'status',
        'metadata',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'payment_date' => 'datetime',
        'payment_amount' => 'decimal:2',
        'is_trial' => 'boolean',
        'metadata' => 'array',
    ];

    public function restaurant()
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function plan()
    {
        return $this->belongsTo(\Modules\Plan\Models\Plan::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->cancelled_at && $this->cancelled_at->isPast()) {
            return false;
        }

        if ($this->is_trial && $this->trial_ends_at) {
            return $this->trial_ends_at->isFuture();
        }

        return $this->ends_at && $this->ends_at->isFuture();
    }

    public function isTrial(): bool
    {
        return $this->is_trial && $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function isExpired(): bool
    {
        return !$this->isActive();
    }
}
