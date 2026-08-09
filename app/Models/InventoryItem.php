<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Concerns\BranchScoped;

class InventoryItem extends Model
{
    use SoftDeletes, BranchScoped;

    protected $guarded = ['id'];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'current_stock' => 'decimal:2',
        'opening_stock' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'reorder_level' => 'decimal:2',
        'expiry_date' => 'date',
        'track_expiry' => 'boolean',
        'track_stock' => 'boolean',
        'is_finished_product' => 'boolean',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    protected $appends = ['image_url'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class, 'item_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'item_id');
    }

    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class, 'inventory_item_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return asset($this->image);
        }
        return null;
    }

    public function getStockValueAttribute(): float
    {
        return round((float) $this->current_stock * (float) $this->unit_cost, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'minimum_stock');
    }

    public function scopeRawMaterial($query)
    {
        return $query->whereIn('type', ['raw_material', 'both']);
    }
}
