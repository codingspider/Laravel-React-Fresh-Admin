<?php

namespace Modules\Branch\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'name',
        'slug',
        'is_main',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'latitude',
        'longitude',
        'timezone',
        'working_hours',
        'holidays',
        'settings',
        'status',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'working_hours' => 'array',
        'holidays' => 'array',
        'settings' => 'array',
    ];

    protected $appends = ['full_address'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(\App\Models\User::class, 'branch_id');
    }

    public function tables(): HasMany
    {
        return $this->hasMany(\Modules\TableManagement\Models\Table::class, 'branch_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(\Modules\Orders\Models\Orders::class, 'branch_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(\Modules\Employee\Models\Employee::class, 'branch_id');
    }

    public function getFullAddressAttribute(): ?string
    {
        $parts = array_filter([$this->address, $this->city, $this->state, $this->country, $this->zip_code]);
        return $parts ? implode(', ', $parts) : null;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    protected static function newFactory(): \Illuminate\Database\Eloquent\Factories\Factory
    {
        return \Modules\Branch\Database\Factories\BranchFactory::new();
    }
}
