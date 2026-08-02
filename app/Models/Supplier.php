<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'opening_balance' => 'decimal:2',
        'credit_limit' => 'decimal:2',
        'payment_terms' => 'integer',
    ];

    protected $appends = ['outstanding_balance'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(SupplierContact::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(SupplierDocument::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(SupplierTransaction::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(SupplierRating::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PurchasePayment::class);
    }

    public function getOutstandingBalanceAttribute(): float
    {
        $totalPurchases = $this->purchases()->sum('total');
        $totalPayments = $this->payments()->where('status', '!=', 'failed')->sum('amount');
        return round((float) $totalPurchases - (float) $totalPayments + (float) $this->opening_balance, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
