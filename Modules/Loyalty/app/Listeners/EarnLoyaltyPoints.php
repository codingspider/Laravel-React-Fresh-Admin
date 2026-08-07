<?php

namespace Modules\Loyalty\Listeners;

use Modules\Loyalty\Services\LoyaltyService;
use Modules\POS\Events\SaleCompleted;

class EarnLoyaltyPoints
{
    public function __construct(protected LoyaltyService $service) {}

    public function handle(SaleCompleted $event): void
    {
        $this->service->earnForSale($event->sale);
    }
}
