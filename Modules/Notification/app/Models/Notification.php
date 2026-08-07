<?php

namespace Modules\Notification\Models;

use Illuminate\Notifications\DatabaseNotification;

class Notification extends DatabaseNotification
{
    protected $table = 'notifications';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'type',
        'notifiable_type',
        'notifiable_id',
        'data',
        'read_at',
        'restaurant_id',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function restaurant()
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function notifiable()
    {
        return $this->morphTo();
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForRestaurant($query, ?int $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
