<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Income extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'accounting_income';

    protected $fillable = [
        'restaurant_id',
        'account_id',
        'branch_id',
        'source',
        'category',
        'reference_number',
        'payment_method',
        'amount',
        'income_date',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'income_date' => 'date',
        'metadata' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }
}
