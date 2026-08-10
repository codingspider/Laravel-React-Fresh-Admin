<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Concerns\BranchScoped;

class Recipe extends Model
{
    use SoftDeletes, BranchScoped;

    protected $guarded = ['id'];

    protected $casts = [
        'selling_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'profit' => 'decimal:2',
        'yield_quantity' => 'decimal:2',
        'preparation_time' => 'integer',
        'cooking_time' => 'integer',
        'status' => 'string',
        'metadata' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(\Modules\Menu\Models\MenuItem::class, 'menu_item_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RecipeCategory::class, 'category_id');
    }

        public function yieldUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'yield_unit_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class)->orderBy('sort_order');
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
