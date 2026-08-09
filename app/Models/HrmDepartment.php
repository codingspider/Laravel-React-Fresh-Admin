<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Concerns\BranchScoped;

class HrmDepartment extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'name',
        'slug',
        'description',
        'head_id',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function head(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    public function designations(): HasMany
    {
        return $this->hasMany(HrmDesignation::class, 'department_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(HrmEmployee::class, 'department_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }
}
