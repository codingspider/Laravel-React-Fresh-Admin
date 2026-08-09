<?php

namespace Modules\POS\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

use App\Models\Concerns\BranchScoped;

class Coupon extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'per_customer_limit',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'per_customer_limit' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        $now = Carbon::now();
        return $query->active()
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereRaw('used_count < usage_limit');
            });
    }

    public function isValid(): bool
    {
        if (!$this->is_active) return false;

        $now = Carbon::now();
        if ($this->starts_at && $this->starts_at->isAfter($now)) return false;
        if ($this->expires_at && $this->expires_at->isBefore($now)) return false;
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) return false;

        return true;
    }

    public function calculateDiscount(float $orderAmount): float
    {
        if (!$this->isValid()) return 0;
        if ($orderAmount < $this->min_order_amount) return 0;

        $discount = 0;
        if ($this->type === 'fixed') {
            $discount = $this->value;
        } else {
            $discount = $orderAmount * ($this->value / 100);
        }

        if ($this->max_discount_amount !== null) {
            $discount = min($discount, $this->max_discount_amount);
        }

        return min($discount, $orderAmount);
    }

    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }
}
