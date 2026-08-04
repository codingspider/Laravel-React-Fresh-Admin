<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'parent_id',
        'code',
        'name',
        'type',
        'account_group',
        'description',
        'is_system',
        'opening_balance',
        'current_balance',
        'status',
        'metadata',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected $appends = ['full_name'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->code} - {$this->name}";
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}
