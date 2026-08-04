<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrmPayroll extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'employee_id',
        'branch_id',
        'pay_period_start',
        'pay_period_end',
        'basic_salary',
        'working_days',
        'present_days',
        'overtime_hours',
        'overtime_rate',
        'bonus',
        'allowance',
        'deduction',
        'pf',
        'tax',
        'net_salary',
        'status',
        'paid_date',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'paid_date' => 'date',
        'metadata' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
