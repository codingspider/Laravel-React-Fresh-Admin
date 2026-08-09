<?php

namespace Modules\CRM\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Customer\Models\Customer;

use App\Models\Concerns\BranchScoped;

class Segment extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $table = 'crm_segments';

    protected $fillable = [
        'restaurant_id',
        'name',
        'color',
        'description',
        'is_dynamic',
        'rules',
        'created_by',
    ];

    protected $casts = [
        'is_dynamic' => 'boolean',
        'rules' => 'array',
    ];

    /**
     * The restaurant this segment belongs to.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }

    /**
     * The user who created this segment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Customers assigned to this segment.
     */
    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'crm_customer_segment', 'crm_segment_id', 'customer_id')
            ->withTimestamps();
    }
}
