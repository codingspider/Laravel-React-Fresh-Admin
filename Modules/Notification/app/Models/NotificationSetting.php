<?php

namespace Modules\Notification\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class NotificationSetting extends Model
{
    use BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'config',
    ];

    protected $casts = [
        'config' => 'array',
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
