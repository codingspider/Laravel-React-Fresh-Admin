<?php

namespace Modules\Loyalty\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Loyalty extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'loyaltys';

    protected $fillable = [
        'restaurant_id',
        'name',
        'slug',
        'description',
        'status',
        'metadata',
        'points_per_order',
        'currency_per_point',
        'min_order_amount',
        'min_points_required',
        'max_redeem_percent',
        'points_expiry_days',
        'enable_earning',
        'enable_redemption',
    ];

    protected $casts = [
        'metadata' => 'array',
        'currency_per_point' => 'decimal:4',
        'min_order_amount' => 'decimal:2',
        'max_redeem_percent' => 'decimal:2',
        'points_per_order' => 'integer',
        'min_points_required' => 'integer',
        'points_expiry_days' => 'integer',
        'enable_earning' => 'boolean',
        'enable_redemption' => 'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }

    public function customerPoints(): HasMany
    {
        return $this->hasMany(LoyaltyCustomerPoints::class, 'loyalty_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyPointsTransaction::class, 'loyalty_id');
    }
}
