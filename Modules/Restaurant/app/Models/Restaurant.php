<?php

namespace Modules\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'latitude',
        'longitude',
        'logo',
        'cover_image',
        'timezone',
        'currency',
        'currency_symbol',
        'tax_rate',
        'tax_name',
        'tax_inclusive',
        'working_hours',
        'holidays',
        'payment_methods',
        'receipt_settings',
        'notification_settings',
        'pos_settings',
        'metadata',
        'status',
        'trial_ends_at',
    ];

    protected $casts = [
        'tax_rate' => 'decimal:2',
        'tax_inclusive' => 'boolean',
        'working_hours' => 'array',
        'holidays' => 'array',
        'payment_methods' => 'array',
        'receipt_settings' => 'array',
        'notification_settings' => 'array',
        'pos_settings' => 'array',
        'metadata' => 'array',
        'trial_ends_at' => 'datetime',
    ];

    protected $appends = ['full_address'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'owner_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(\Modules\Branch\Models\Branch::class);
    }

    public function mainBranch(): HasMany
    {
        return $this->branches()->where('is_main', true);
    }

    public function users(): HasMany
    {
        return $this->hasMany(\App\Models\User::class);
    }

    public function menuCategories(): HasMany
    {
        return $this->hasMany(\Modules\Menu\Models\MenuCategory::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(\Modules\Menu\Models\MenuItem::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(\Modules\Customer\Models\Customer::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(\Modules\Orders\Models\Orders::class);
    }

    public function tables(): HasMany
    {
        return $this->hasMany(\Modules\TableManagement\Models\Table::class);
    }

    public function subscription()
    {
        return $this->hasOne(\Modules\Subscription\Models\Subscription::class)->latest();
    }

    public function activeSubscription()
    {
        return $this->hasOne(\Modules\Subscription\Models\Subscription::class)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->latest();
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

    public function isTrialExpired(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isPast();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }

    public function isSubscriptionOrTrialActive(): bool
    {
        if (isSuperAdmin()) {
            return true;
        }

        if ($this->isTrialExpired() && !$this->hasActiveSubscription()) {
            return false;
        }

        return true;
    }
}
