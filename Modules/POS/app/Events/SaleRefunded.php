<?php

namespace Modules\POS\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Modules\POS\Models\Sale;

class SaleRefunded
{
    use Dispatchable;

    public function __construct(
        public Sale $sale,
        public array $refundData,
    ) {}
}
