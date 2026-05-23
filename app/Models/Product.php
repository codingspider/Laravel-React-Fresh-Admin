<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['id'];


    public function getImageUrlAttribute()
    {
        if (!$this->main_image) {
            return null;
        }

        return asset($this->main_image);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
