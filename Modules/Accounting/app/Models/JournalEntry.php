<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JournalEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'accounting_journal_entries';

    protected $fillable = [
        'restaurant_id',
        'account_id',
        'related_id',
        'related_type',
        'reference_number',
        'voucher_number',
        'entry_type',
        'amount',
        'entry_date',
        'description',
        'source_module',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'entry_date' => 'date',
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

    public function related(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function scopeByAccount($query, $accountId)
    {
        return $query->where('account_id', $accountId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('entry_type', $type);
    }

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->whereBetween('entry_date', [$from, $to]);
    }
}
