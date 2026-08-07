<?php

namespace Modules\Loyalty\Listeners;

use Modules\Loyalty\Services\LoyaltyService;
use Modules\POS\Events\PaymentProcessed;

class HandleLoyaltyPayment
{
    public function __construct(protected LoyaltyService $service) {}

    public function handle(PaymentProcessed $event): void
    {
        if (($event->paymentData['payment_method'] ?? null) !== 'loyalty') {
            return;
        }

        $this->service->redeemForSale(
            $event->sale,
            (float) ($event->paymentData['amount'] ?? 0),
            $event->paymentData['reference_number'] ?? null
        );
    }
}
