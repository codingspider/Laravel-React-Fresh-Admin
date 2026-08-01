<?php

namespace Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'name',
        'company',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'notes',
        'is_active',
        'status',
    ];
    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }
}
