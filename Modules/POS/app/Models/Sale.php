<?php

namespace Modules\POS\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'pos_session_id',
        'table_id',
        'customer_id',
        'user_id',
        'invoice_number',
        'order_type',
        'status',
        'subtotal',
        'discount_amount',
        'discount_percent',
        'tax_amount',
        'tax_percent',
        'delivery_charge',
        'tip_amount',
        'round_off',
        'total',
        'amount_paid',
        'refund_amount',
        'change_amount',
        'payment_status',
        'notes',
        'kitchen_notes',
        'coupon_code',
        'priority',
        'chef_user_id',
        'started_at',
        'ready_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'tax_percent' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'tip_amount' => 'decimal:2',
        'round_off' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'started_at' => 'datetime',
        'ready_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function posSession(): BelongsTo
    {
        return $this->belongsTo(PosSession::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(\Modules\TableManagement\Models\Table::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(\Modules\Customer\Models\Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $lastSale = self::where('invoice_number', 'like', "INV-{$date}-%")
            ->orderByDesc('id')
            ->first();

        if ($lastSale) {
            $lastNumber = (int) substr($lastSale->invoice_number, -5);
            $nextNumber = str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '00001';
        }

        return "INV-{$date}-{$nextNumber}";
    }
}
