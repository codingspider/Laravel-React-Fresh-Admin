<?php

namespace Modules\Purchase\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['restaurant_id', 'name', 'status'];
    protected $casts = ['metadata' => 'array'];

    public function restaurant()
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }
}
