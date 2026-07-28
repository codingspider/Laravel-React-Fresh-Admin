<?php

namespace Modules\Package\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'description', 'modules', 'status', 'metadata'];

    protected $casts = [
        'modules' => 'array',
        'metadata' => 'array',
    ];

    public function plans()
    {
        return $this->belongsToMany(\Modules\Plan\Models\Plan::class, 'plan_package');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
