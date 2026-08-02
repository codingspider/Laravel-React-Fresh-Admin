<?php

namespace Modules\CustomerDisplay\Services;

use Illuminate\Support\Facades\Log;
use Modules\CustomerDisplay\Models\CustomerDisplaySetting;
use Modules\POS\Models\Coupon;
use Modules\POS\Models\Sale;
use Modules\Restaurant\Models\Restaurant;

class CustomerDisplayService
{
    /**
     * Build the public customer display board for a restaurant.
     *
     * This is deliberately public (no authentication) so the monitor can be
     * shown on a secondary screen for all customers to see without login.
     *
     * @param int|null $restaurantId  falls back to the only restaurant when omitted
     * @param int|null $branchId      optional branch filter
     * @return array<string, mixed>
     */
    public function board(?int $restaurantId = null, ?int $branchId = null): array
    {
        $restaurant = $this->resolveRestaurant($this->resolveRestaurantId($restaurantId));

        if (!$restaurant) {
            return [
                'restaurant' => null,
                'settings' => null,
                'orders' => [],
                'promotions' => [],
                'generated_at' => now()->toISOString(),
            ];
        }

        $settings = $this->settings($restaurant->id);
        $statuses = $settings->getStatusesAttribute();

        $orders = Sale::with(['items', 'table', 'branch', 'customer'])
            ->where('restaurant_id', $restaurant->id)
            ->whereIn('status', $statuses)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->latest('id')
            ->get()
            ->map(fn (Sale $sale) => $this->decorate($sale));

        $promotions = $settings->show_promotions
            ? $this->promotions($restaurant->id)
            : [];

        return [
            'restaurant' => $this->restaurantInfo($restaurant),
            'settings' => [
                'show_payment_qr' => $settings->show_payment_qr,
                'show_promotions' => $settings->show_promotions,
                'refresh_interval' => $settings->refresh_interval,
                'payment_qr_image' => $settings->payment_qr_image
                    ? '/' . ltrim($settings->payment_qr_image, '/')
                    : null,
            ],
            'orders' => $orders,
            'promotions' => $promotions,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Get (or create) the display settings for a restaurant.
     */
    public function settings(int $restaurantId, ?int $branchId = null): CustomerDisplaySetting
    {
        return CustomerDisplaySetting::firstOrCreate(
            ['restaurant_id' => $restaurantId, 'branch_id' => $branchId],
            [
                'show_payment_qr' => true,
                'show_promotions' => true,
                'refresh_interval' => (int) config('customersdisplay.default_refresh_interval', 10),
                'active_statuses' => config('customersdisplay.active_statuses', []),
            ]
        );
    }

    /**
     * Update display settings, replacing the payment QR image when uploaded.
     *
     * @return CustomerDisplaySetting
     */
    public function updateSettings(int $restaurantId, array $data, $qrFile = null): CustomerDisplaySetting
    {
        $settings = $this->settings($restaurantId);

        $payload = $data;

        if ($qrFile) {
            $payload['payment_qr_image'] = uploadImage(
                $qrFile,
                (string) config('customersdisplay.qr_upload_folder', 'uploads/customer-display'),
                $settings->payment_qr_image
            );
        }

        $settings->update($payload);

        return $settings->refresh();
    }

    /**
     * Resolve the restaurant for the public board.
     */
    protected function resolveRestaurant(?int $restaurantId): ?Restaurant
    {
        if ($restaurantId) {
            return Restaurant::find($restaurantId);
        }

        return Restaurant::query()->orderBy('id')->first();
    }

    /**
     * Resolve a restaurant id, falling back to the first restaurant in the
     * installation. This keeps the public board and the settings page working
     * for users whose account is not explicitly linked to a restaurant.
     */
    public function resolveRestaurantId(?int $restaurantId = null): ?int
    {
        if ($restaurantId) {
            return $restaurantId;
        }

        return Restaurant::query()->orderBy('id')->value('id');
    }

    /**
     * Public-safe restaurant summary.
     *
     * @return array<string, mixed>
     */
    protected function restaurantInfo(Restaurant $restaurant): array
    {
        return [
            'id' => $restaurant->id,
            'name' => $restaurant->name,
            'logo' => $restaurant->logo ? '/' . ltrim($restaurant->logo, '/') : null,
            'phone' => $restaurant->phone,
            'address' => $restaurant->full_address,
            'currency' => $restaurant->currency,
            'currency_symbol' => $restaurant->currency_symbol,
            'tax_name' => $restaurant->tax_name,
            'tax_inclusive' => (bool) $restaurant->tax_inclusive,
        ];
    }

    /**
     * Attach display-friendly metadata to a sale.
     *
     * @return array<string, mixed>
     */
    protected function decorate(Sale $sale): array
    {
        $elapsedMinutes = $sale->created_at ? max(0, (int) $sale->created_at->diffInMinutes(now())) : 0;

        return [
            'id' => $sale->id,
            'invoice_number' => $sale->invoice_number,
            'order_type' => $sale->order_type,
            'status' => $sale->status,
            'priority' => $sale->priority,
            'elapsed_minutes' => $elapsedMinutes,
            'created_at' => $sale->created_at?->toISOString(),
            'table' => $sale->table ? ['id' => $sale->table->id, 'name' => $sale->table->name] : null,
            'branch' => $sale->branch ? ['id' => $sale->branch->id, 'name' => $sale->branch->name] : null,
            'customer' => $sale->customer ? [
                'id' => $sale->customer->id,
                'name' => $sale->customer->name,
            ] : null,
            'items' => $sale->items->map(fn ($item) => [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
                'notes' => $item->notes,
                'modifiers' => $item->modifiers ?? [],
            ]),
            'subtotal' => (float) $sale->subtotal,
            'discount_amount' => (float) $sale->discount_amount,
            'discount_percent' => (float) $sale->discount_percent,
            'tax_amount' => (float) $sale->tax_amount,
            'tax_percent' => (float) $sale->tax_percent,
            'delivery_charge' => (float) $sale->delivery_charge,
            'tip_amount' => (float) $sale->tip_amount,
            'round_off' => (float) $sale->round_off,
            'total' => (float) $sale->total,
            'amount_paid' => (float) $sale->amount_paid,
            'payment_status' => $sale->payment_status,
            'coupon_code' => $sale->coupon_code,
        ];
    }

    /**
     * Active promotions (valid coupons) shown on the public board.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function promotions(int $restaurantId): array
    {
        return Coupon::query()
            ->valid()
            ->where('restaurant_id', $restaurantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Coupon $coupon) => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
                'min_order_amount' => (float) $coupon->min_order_amount,
                'max_discount_amount' => $coupon->max_discount_amount !== null
                    ? (float) $coupon->max_discount_amount
                    : null,
                'expires_at' => $coupon->expires_at?->toISOString(),
            ])
            ->all();
    }
}
