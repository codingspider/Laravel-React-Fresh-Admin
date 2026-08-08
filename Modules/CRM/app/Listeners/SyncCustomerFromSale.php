<?php

namespace Modules\CRM\Listeners;

use Modules\CRM\Services\CrmCustomerService;
use Modules\POS\Events\SaleCompleted;

class SyncCustomerFromSale
{
    public function __construct(protected CrmCustomerService $customerService) {}

    /**
     * Capture or link a customer from a completed POS sale and update the
     * customer's aggregated spend/visit counters.
     */
    public function handle(SaleCompleted $event): void
    {
        $sale = $event->sale;

        if (!$sale->restaurant_id || $sale->status !== 'completed') {
            return;
        }

        $customerId = $this->customerService->syncFromSale(
            (int) $sale->restaurant_id,
            $sale->customer_id,
            [
                'name' => $sale->guest_name,
                'phone' => $sale->guest_phone,
                'email' => null,
                'source' => $sale->source ?: 'pos',
            ],
            (float) $sale->total,
        );

        if ($customerId && !$sale->customer_id) {
            $sale->forceFill(['customer_id' => $customerId])->save();
        }
    }
}
