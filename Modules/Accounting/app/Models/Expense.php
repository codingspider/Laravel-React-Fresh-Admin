<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class Expense extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $table = 'accounting_expenses';

    protected $fillable = [
        'restaurant_id',
        'accounting_expense_category_id',
        'account_id',
        'supplier_id',
        'branch_id',
        'reference_number',
        'payment_method',
        'amount',
        'expense_date',
        'notes',
        'attachment',
        'status',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'metadata' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'accounting_expense_category_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(\Modules\Supplier\Models\Supplier::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public function scopeForRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }
}
