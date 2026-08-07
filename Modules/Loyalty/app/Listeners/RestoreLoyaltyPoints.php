<?php

namespace Modules\Loyalty\Listeners;

use Modules\Loyalty\Services\LoyaltyService;
use Modules\POS\Events\SaleRefunded;

class RestoreLoyaltyPoints
{
    public function __construct(protected LoyaltyService $service) {}

    public function handle(SaleRefunded $event): void
    {
        $this->service->restoreForRefund(
            $event->sale,
            (float) ($event->refundData['amount'] ?? 0)
        );
    }
}
