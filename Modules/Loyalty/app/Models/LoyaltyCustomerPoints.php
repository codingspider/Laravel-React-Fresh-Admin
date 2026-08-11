<?php

namespace Modules\Loyalty\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Concerns\BranchScoped;

class LoyaltyCustomerPoints extends Model
{
    use HasFactory, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'customer_id',
        'loyalty_id',
        'points_balance',
        'lifetime_points',
        'total_redeemed',
        'last_earned_at',
        'last_redeemed_at',
    ];

    protected $casts = [
        'points_balance' => 'integer',
        'lifetime_points' => 'integer',
        'total_redeemed' => 'integer',
        'last_earned_at' => 'datetime',
        'last_redeemed_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(\Modules\Customer\Models\Customer::class);
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Loyalty::class, 'loyalty_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyPointsTransaction::class, 'customer_id');
    }
}
