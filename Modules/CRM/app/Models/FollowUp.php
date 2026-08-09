<?php

namespace Modules\CRM\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Customer\Models\Customer;

use App\Models\Concerns\BranchScoped;

class FollowUp extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $table = 'crm_follow_ups';

    protected $fillable = [
        'restaurant_id',
        'customer_id',
        'title',
        'notes',
        'due_at',
        'status',
        'assigned_to',
        'created_by',
        'completed_at',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * The restaurant this follow-up belongs to.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }

    /**
     * The customer this follow-up is about.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The user assigned to this follow-up.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    /**
     * The user who created this follow-up.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
