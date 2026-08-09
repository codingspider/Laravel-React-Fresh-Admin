<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Concerns\BranchScoped;

class HrmEmployee extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'user_id',
        'department_id',
        'designation_id',
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'date_of_birth',
        'date_of_joining',
        'gender',
        'employment_type',
        'emergency_contact_name',
        'emergency_contact_number',
        'salary',
        'overtime_rate',
        'pf',
        'tax',
        'photo',
        'status',
        'metadata',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_joining' => 'date',
        'salary' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'pf' => 'decimal:2',
        'tax' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected $appends = ['full_name'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(HrmDepartment::class, 'department_id');
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(HrmDesignation::class, 'designation_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(HrmAttendance::class, 'employee_id');
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(HrmLeaveRequest::class, 'employee_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }
}
