<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrmPayrollAllowance extends Model
{
    protected $fillable = [
        'payroll_id',
        'type',
        'amount',
        'calculation_type',
        'calculated_amount',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'calculated_amount' => 'decimal:2',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(HrmPayroll::class, 'payroll_id');
    }
}
