<?php

namespace Modules\Currency\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Currency extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'symbol',
        'symbol_first',
        'decimal_mark',
        'thousands_separator',
        'precision',
        'is_active',
    ];

    protected $casts = [
        'symbol_first' => 'boolean',
        'is_active' => 'boolean',
        'precision' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
