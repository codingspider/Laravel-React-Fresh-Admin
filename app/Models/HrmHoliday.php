<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class HrmHoliday extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'name',
        'date',
        'type',
        'status',
        'is_optional',
        'description',
        'metadata',
    ];

    protected $casts = [
        'date' => 'date',
        'is_optional' => 'boolean',
        'metadata' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
