<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class Unit extends Model
{
    use SoftDeletes, BranchScoped;

    protected $guarded = ['id'];

    protected $casts = [
        'allow_decimal' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
