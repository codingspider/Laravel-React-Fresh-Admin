<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DatabaseBackup extends Model
{
    protected $fillable = [
        'filename',
        'path',
        'size',
        'status',
        'type',
        'created_by',
        'restored_at',
    ];

    protected $casts = [
        'size' => 'integer',
        'restored_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
