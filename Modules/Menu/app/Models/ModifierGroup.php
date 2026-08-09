<?php

namespace Modules\Menu\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Concerns\BranchScoped;

class ModifierGroup extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'name',
        'is_required',
        'min_selections',
        'max_selections',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function modifiers(): HasMany
    {
        return $this->hasMany(Modifier::class);
    }

    public function menuItems(): BelongsToMany
    {
        return $this->belongsToMany(MenuItem::class);
    }
}
