<?php

namespace Modules\POS\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Concerns\BranchScoped;

class PosSetting extends Model
{
    use HasFactory, BranchScoped;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'order_types',
        'payment_methods',
        'tax_config',
        'default_tax_rate',
        'default_tax_name',
        'enable_discount',
        'enable_coupon',
        'enable_shipping',
        'enable_tip',
        'enable_notes',
        'enable_kitchen_notes',
        'enable_table_management',
        'enable_customer',
    ];

    protected $casts = [
        'order_types' => 'array',
        'payment_methods' => 'array',
        'tax_config' => 'array',
        'default_tax_rate' => 'decimal:2',
        'enable_discount' => 'boolean',
        'enable_coupon' => 'boolean',
        'enable_shipping' => 'boolean',
        'enable_tip' => 'boolean',
        'enable_notes' => 'boolean',
        'enable_kitchen_notes' => 'boolean',
        'enable_table_management' => 'boolean',
        'enable_customer' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(\Modules\Restaurant\Models\Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\Modules\Branch\Models\Branch::class);
    }

    public static function getDefaultOrderTypes(): array
    {
        return [
            ['value' => 'dine_in', 'label' => 'Dine In', 'enabled' => true],
            ['value' => 'takeaway', 'label' => 'Takeaway', 'enabled' => true],
            ['value' => 'delivery', 'label' => 'Delivery', 'enabled' => true],
        ];
    }

    public static function getDefaultPaymentMethods(): array
    {
        return [
            ['value' => 'cash', 'label' => 'Cash', 'enabled' => true],
            ['value' => 'card', 'label' => 'Card', 'enabled' => true],
            ['value' => 'upi', 'label' => 'UPI', 'enabled' => true],
            ['value' => 'online', 'label' => 'Online', 'enabled' => true],
            ['value' => 'credit', 'label' => 'Credit', 'enabled' => true],
            ['value' => 'loyalty', 'label' => 'Loyalty', 'enabled' => true],
            ['value' => 'gift_card', 'label' => 'Gift Card', 'enabled' => true],
            ['value' => 'other', 'label' => 'Other', 'enabled' => true],
        ];
    }

    public function getActiveOrderTypesAttribute(): array
    {
        $types = $this->order_types ?? self::getDefaultOrderTypes();
        return array_filter($types, fn($t) => $t['enabled'] ?? true);
    }

    public function getActivePaymentMethodsAttribute(): array
    {
        $methods = $this->payment_methods ?? self::getDefaultPaymentMethods();
        return array_filter($methods, fn($m) => $m['enabled'] ?? true);
    }
}
