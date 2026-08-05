<?php

namespace Modules\TableManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Table extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'floor_id',
        'name',
        'qr_token',
        'qr_code_url',
        'qr_image',
        'capacity',
        'sort_order',
        'status',
        'position',
        'metadata',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'position' => 'array',
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Table $table) {
            if (empty($table->qr_token)) {
                $table->qr_token = 'tbl_' . Str::random(32);
            }
            $table->qr_code_url = url("/order?table={$table->qr_token}");
        });

        static::created(function (Table $table) {
            $qrImage = saveQrCodeFile($table);
            if ($qrImage) {
                $table->update(['qr_image' => $qrImage]);
            }
        });
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(\Modules\Orders\Models\Orders::class, 'table_id');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isOccupied(): bool
    {
        return $this->status === 'occupied';
    }

    public function isReserved(): bool
    {
        return $this->status === 'reserved';
    }

    public function getQrUrlAttribute(): string
    {
        return url("/order?table={$this->qr_token}");
    }
}
