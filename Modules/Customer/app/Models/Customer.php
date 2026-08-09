<?php

namespace Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Concerns\BranchScoped;

class Customer extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

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
        'dob',
        'anniversary',
        'gender',
        'favourite_food',
        'source',
        'lead_status',
        'last_visit_at',
        'total_spent',
        'total_orders',
        'is_active',
        'status',
    ];
    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'dob' => 'date',
        'anniversary' => 'date',
        'last_visit_at' => 'datetime',
        'total_spent' => 'float',
    ];

    public function restaurant()
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }

    /**
     * CRM segments this customer belongs to.
     */
    public function segments()
    {
        return $this->belongsToMany(\Modules\CRM\Models\Segment::class, 'crm_customer_segment', 'customer_id', 'crm_segment_id')
            ->withTimestamps();
    }

    /**
     * Follow-ups scheduled for this customer.
     */
    public function followUps()
    {
        return $this->hasMany(\Modules\CRM\Models\FollowUp::class);
    }

    /**
     * Timeline notes attached to this customer.
     */
    public function crmNotes()
    {
        return $this->hasMany(\Modules\CRM\Models\CrmNote::class);
    }
}
