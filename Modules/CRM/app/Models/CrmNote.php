<?php

namespace Modules\CRM\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Customer\Models\Customer;

use App\Models\Concerns\BranchScoped;

class CrmNote extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $table = 'crm_notes';

    protected $fillable = [
        'restaurant_id',
        'customer_id',
        'body',
        'created_by',
    ];

    /**
     * The restaurant this note belongs to.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Restaurant::class);
    }

    /**
     * The customer this note belongs to.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The user who created this note.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
