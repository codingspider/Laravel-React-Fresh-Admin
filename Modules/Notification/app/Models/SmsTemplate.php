<?php

namespace Modules\Notification\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class SmsTemplate extends Model
{
    use BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'name',
        'body',
        'channel',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }
}
