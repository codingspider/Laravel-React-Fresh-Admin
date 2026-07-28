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
        return $this->status === 'active' && $this->ends_at->isFuture();
    }
}
