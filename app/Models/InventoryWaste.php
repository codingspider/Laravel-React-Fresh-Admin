<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryWaste extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'total_quantity' => 'decimal:2',
        'total_value' => 'decimal:2',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryWasteItem::class, 'waste_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
