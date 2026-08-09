<?php

namespace Modules\Loyalty\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class LoyaltyPointsTransaction extends Model
{
    use HasFactory, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'customer_id',
        'loyalty_id',
        'type',
        'points',
        'balance_after',
        'sale_id',
        'reference',
        'reason',
        'created_by',
    ];

    protected $casts = [
        'points' => 'integer',
        'balance_after' => 'integer',
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

    public function sale(): BelongsTo
    {
        return $this->belongsTo(\Modules\POS\Models\Sale::class, 'sale_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
