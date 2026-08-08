<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Branch\Models\Branch;
use Modules\Restaurant\Models\Restaurant;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'branch_id',
        'action',
        'method',
        'path',
        'route_name',
        'description',
        'request_data',
        'response_status',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_status' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
