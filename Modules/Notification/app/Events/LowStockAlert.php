<?php

namespace Modules\Notification\Events;

use App\Models\InventoryItem;
use Illuminate\Foundation\Events\Dispatchable;

class LowStockAlert
{
    use Dispatchable;

    public function __construct(
        public InventoryItem $item,
        public float $currentStock,
        public ?int $restaurantId = null,
    ) {}
}
