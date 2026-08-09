<?php

namespace Modules\Orders\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Concerns\BranchScoped;

class Orders extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = ['restaurant_id', 'name', 'status'];
    protected $casts = ['metadata' => 'array'];

    public function restaurant()
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }
}
