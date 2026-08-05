<?php

namespace Modules\GuestOrder\Services;

use Illuminate\Support\Facades\DB;
use Modules\GuestOrder\Models\GuestSession;
use Modules\POS\Models\Sale;
use Modules\POS\Models\SaleItem;
use Modules\POS\Models\Payment;
use Modules\TableManagement\Models\Table;
use Modules\Menu\Models\MenuItem;
use Modules\Menu\Models\ModifierGroup;
use Modules\Restaurant\Models\Restaurant;

class GuestOrderService
{
    public function resolveTable(string $token): ?array
    {
        $table = Table::where('qr_token', $token)
            ->with(['restaurant:id,name,logo,currency,currency_symbol,tax_rate,tax_name,tax_inclusive', 'branch:id,name'])
            ->first();

        if (!$table) {
            return null;
        }

        return [
            'table_id' => $table->id,
            'table_name' => $table->name,
            'restaurant_id' => $table->restaurant_id,
            'restaurant' => [
                'id' => $table->restaurant->id,
                'name' => $table->restaurant->name,
                'logo' => $table->restaurant->logo,
                'currency' => $table->restaurant->currency,
                'currency_symbol' => $table->restaurant->currency_symbol,
                'tax_rate' => $table->restaurant->tax_rate,
                'tax_name' => $table->restaurant->tax_name,
                'tax_inclusive' => $table->restaurant->tax_inclusive,
            ],
            'qr_ordering' => [
                'enabled' => (bool) ($table->restaurant->metadata['qr_ordering']['enabled'] ?? true),
                'allow_guest_name' => (bool) ($table->restaurant->metadata['qr_ordering']['allow_guest_name'] ?? false),
                'allow_guest_phone' => (bool) ($table->restaurant->metadata['qr_ordering']['allow_guest_phone'] ?? false),
                'show_preparation_time' => (bool) ($table->restaurant->metadata['qr_ordering']['show_preparation_time'] ?? true),
                'default_order_type' => $table->restaurant->metadata['qr_ordering']['default_order_type'] ?? 'dine_in',
            ],
            'branch_id' => $table->branch_id,
            'branch' => $table->branch ? [
                'id' => $table->branch->id,
                'name' => $table->branch->name,
            ] : null,
        ];
    }

    public function getMenu(int $restaurantId, ?int $branchId = null): array
    {
        $categories = \Modules\Menu\Models\MenuCategory::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->with(['menuItems' => function ($q) use ($restaurantId) {
                $q->where('status', 'active')
                    ->with(['modifierGroups' => function ($g) {
                        $g->where('status', 'active')
                            ->with(['modifiers' => function ($m) {
                                $m->where('status', 'active');
                            }]);
                    }]);
            }])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn ($cat) => $cat->menuItems->count() > 0)
            ->values();

        return $categories->map(fn ($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'image' => $cat->image,
            'items' => $cat->menuItems->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'image' => $item->image,
                'price' => (float) $item->price,
                'is_vegetarian' => $item->is_vegetarian,
                'is_vegan' => $item->is_vegan,
                'is_gluten_free' => $item->is_gluten_free,
                'preparation_time' => $item->preparation_time,
                'modifier_groups' => $item->modifierGroups->map(fn ($mg) => [
                    'id' => $mg->id,
                    'name' => $mg->name,
                    'is_required' => $mg->is_required,
                    'min_selections' => $mg->min_selections,
                    'max_selections' => $mg->max_selections,
                    'modifiers' => $mg->modifiers->map(fn ($m) => [
                        'id' => $m->id,
                        'name' => $m->name,
                        'price' => (float) $m->price,
                        'is_default' => $m->is_default,
                    ]),
                ]),
            ])->values(),
        ])->values()->toArray();
    }

    public function placeOrder(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $restaurant = Restaurant::findOrFail($data['restaurant_id']);
            $taxRate = (float) $restaurant->tax_rate;
            $taxInclusive = (bool) $restaurant->tax_inclusive;

            $subtotal = 0;
            $totalTax = 0;

            $itemsData = collect($data['items'])->map(function ($item) use ($taxRate, $taxInclusive, &$subtotal, &$totalTax) {
                $qty = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $lineSubtotal = $qty * $unitPrice;

                $modifierTotal = 0;
                if (!empty($item['modifiers'])) {
                    foreach ($item['modifiers'] as $mod) {
                        $modifierTotal += (float) ($mod['price'] ?? 0);
                    }
                }
                $lineSubtotal += $modifierTotal * $qty;

                $taxAmount = 0;
                if ($taxInclusive) {
                    $taxAmount = $lineSubtotal - ($lineSubtotal / (1 + $taxRate / 100));
                } else {
                    $taxAmount = ($lineSubtotal * $taxRate) / 100;
                }

                $subtotal += $lineSubtotal;
                $totalTax += $taxAmount;

                return [
                    'menu_item_id' => $item['menu_item_id'],
                    'item_name' => $item['item_name'] ?? '',
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'tax_amount' => round($taxAmount, 2),
                    'total' => round($lineSubtotal + ($taxInclusive ? 0 : $taxAmount), 2),
                    'notes' => $item['notes'] ?? null,
                    'modifiers' => !empty($item['modifiers']) ? $item['modifiers'] : null,
                ];
            });

            $grandTotal = $taxInclusive ? $subtotal : $subtotal + $totalTax;

            $sale = Sale::create([
                'restaurant_id' => $data['restaurant_id'],
                'branch_id' => $data['branch_id'] ?? null,
                'table_id' => $data['table_id'] ?? null,
                'customer_id' => null,
                'guest_name' => $data['guest_name'] ?? null,
                'guest_phone' => $data['guest_phone'] ?? null,
                'user_id' => 1,
                'invoice_number' => Sale::generateInvoiceNumber($data['restaurant_id']),
                'order_type' => 'dine_in',
                'status' => 'pending',
                'source' => 'qr',
                'subtotal' => round($subtotal, 2),
                'tax_amount' => round($totalTax, 2),
                'tax_percent' => $taxRate,
                'total' => round($grandTotal, 2),
                'amount_paid' => 0,
                'payment_status' => 'unpaid',
                'notes' => $data['notes'] ?? null,
            ]);

            $itemsData->each(function ($item) use ($sale) {
                SaleItem::create(array_merge($item, ['sale_id' => $sale->id]));
            });

            Payment::create([
                'sale_id' => $sale->id,
                'restaurant_id' => $data['restaurant_id'],
                'branch_id' => $data['branch_id'] ?? null,
                'user_id' => 1,
                'payment_method' => 'cash',
                'amount' => 0,
            ]);

            if (!empty($data['table_id'])) {
                Table::where('id', $data['table_id'])->update(['status' => 'occupied']);
            }

            return $sale->load(['items.menuItem', 'table', 'branch']);
        });
    }

    public function trackOrder(string $invoiceNumber): ?Sale
    {
        return Sale::where('invoice_number', $invoiceNumber)
            ->with(['items.menuItem', 'table', 'branch'])
            ->first();
    }
}
