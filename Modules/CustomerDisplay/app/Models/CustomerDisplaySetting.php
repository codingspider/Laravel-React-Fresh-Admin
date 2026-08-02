<?php

namespace Modules\CustomerDisplay\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerDisplaySetting extends Model
{
    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'payment_qr_image',
        'show_payment_qr',
        'show_promotions',
        'refresh_interval',
        'active_statuses',
    ];

    protected $casts = [
        'show_payment_qr' => 'boolean',
        'show_promotions' => 'boolean',
        'refresh_interval' => 'integer',
        'active_statuses' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    /**
     * The statuses that should appear on the public board.
     *
     * @return array<int, string>
     */
    public function getStatusesAttribute(): array
    {
        return $this->active_statuses ?? config('customersdisplay.active_statuses', []);
    }
}
