<?php

namespace Modules\KitchenDisplay\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use App\Models\Recipe;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\POS\Models\Sale;

class KitchenDisplayService
{
    public function __construct(protected StockService $stockService) {}

    /**
     * Fetch the live kitchen board.
     *
     * Orders in kitchen statuses (new / preparing / ready) are grouped by
     * status column, enriched with elapsed minutes and a delayed flag, and
     * returned together with aggregate stats.
     *
     * @param array $filters  restaurant_id, branch_id
     * @return array{columns: array, stats: array, delayed: int, generated_at: string}
     */
    public function board(array $filters = []): array
    {
        $restaurantId = $filters['restaurant_id'] ?? getRestaurantId();
        $threshold = (int) config('kitchendisplay.delay_threshold_minutes', 15);

        $query = Sale::with(['items', 'table', 'customer', 'user', 'branch'])
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready']);

        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        $orders = $query->latest('id')->get()->map(fn (Sale $sale) => $this->decorate($sale, $threshold));

        $columns = [];
        foreach (config('kitchendisplay.statuses', []) as $key => $statuses) {
            $columns[$key] = $orders->filter(function ($order) use ($statuses) {
                return in_array($order['status'], $statuses, true);
            })->values();
        }

        $stats = [
            'new' => $columns['new']->count(),
            'preparing' => $columns['preparing']->count(),
            'ready' => $columns['ready']->count(),
            'delayed' => $orders->where('is_delayed', true)->count(),
        ];

        return [
            'columns' => $columns,
            'stats' => $stats,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Attach display-friendly metadata to a sale.
     *
     * @return array<string, mixed>
     */
    protected function decorate(Sale $sale, int $thresholdMinutes): array
    {
        $elapsedMinutes = $sale->created_at ? max(0, (int) $sale->created_at->diffInMinutes(now())) : 0;
        $cookingMinutes = $sale->started_at ? max(0, (int) $sale->started_at->diffInMinutes(now())) : null;

        $isDelayed = $elapsedMinutes > $thresholdMinutes;

        return [
            'id' => $sale->id,
            'invoice_number' => $sale->invoice_number,
            'order_type' => $sale->order_type,
            'status' => $sale->status,
            'priority' => $sale->priority,
            'chef_user_id' => $sale->chef_user_id,
            'kitchen_notes' => $sale->kitchen_notes,
            'elapsed_minutes' => $elapsedMinutes,
            'cooking_minutes' => $cookingMinutes,
            'is_delayed' => $isDelayed,
            'created_at' => $sale->created_at?->toISOString(),
            'started_at' => $sale->started_at?->toISOString(),
            'ready_at' => $sale->ready_at?->toISOString(),
            'items' => $sale->items->map(fn ($item) => [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'quantity' => $item->quantity,
                'notes' => $item->notes,
                'modifiers' => $item->modifiers,
            ]),
            'table' => $sale->table ? ['id' => $sale->table->id, 'name' => $sale->table->name] : null,
            'branch' => $sale->branch ? ['id' => $sale->branch->id, 'name' => $sale->branch->name] : null,
            'customer' => $sale->customer ? [
                'id' => $sale->customer->id,
                'name' => $sale->customer->name,
                'phone' => $sale->customer->phone,
            ] : null,
            'user' => $sale->user ? ['id' => $sale->user->id, 'name' => $sale->user->name] : null,
        ];
    }

    /**
     * Transition a kitchen order to a new status, maintaining KDS timestamps.
     * Deducts stock only when the order is accepted (status transitions to "confirmed").
     */
    public function updateStatus(Sale $sale, string $status): Sale
    {
        $oldStatus = $sale->status;
        $data = ['status' => $status];

        if ($status === 'preparing' && !$sale->started_at) {
            $data['started_at'] = now();
        }

        if ($status === 'ready') {
            $data['ready_at'] = now();
        }

        if (in_array($status, ['served', 'cancelled', 'completed'], true)) {
            $data['ready_at'] = $sale->ready_at ?? now();
        }

        DB::transaction(function () use ($sale, $data, $oldStatus, $status) {
            $sale->update($data);

            if ($status === 'confirmed' && !in_array($oldStatus, ['confirmed', 'preparing', 'ready', 'served', 'completed'], true)) {
                $this->deductStockForOrder($sale);
            }
        });

        return $sale->refresh();
    }

    /**
     * Deduct ingredient stock when an order is accepted by the kitchen.
     * Only deducts if the sale item's menu item has an active recipe with auto_deduct_stock enabled.
     */
    protected function deductStockForOrder(Sale $sale): void
    {
        try {
            $restaurantId = $sale->restaurant_id;
            $branchId = $sale->branch_id;

            foreach ($sale->items as $item) {
                $recipe = Recipe::where('menu_item_id', $item->menu_item_id)
                    ->where('status', 'active')
                    ->when($restaurantId, fn($q) => $q->where('restaurant_id', $restaurantId))
                    ->first();

                if (!$recipe || $recipe->auto_deduct_stock !== 'yes') {
                    continue;
                }

                $multiplier = (float) $item->quantity;

                foreach ($recipe->ingredients as $ingredient) {
                    $inventoryItem = $ingredient->inventoryItem;
                    if (!$inventoryItem) {
                        continue;
                    }

                    $qty = (float) $ingredient->quantity * $multiplier;
                    if ($qty <= 0) {
                        continue;
                    }

                    $this->stockService->adjustStock(
                        $inventoryItem->id,
                        -$qty,
                        'consumption',
                        $restaurantId,
                        $branchId,
                        $recipe->id,
                        Recipe::class,
                        'Order accepted: ' . $sale->invoice_number,
                        (float) $ingredient->unit_cost
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to deduct stock for order: ' . $e->getMessage(), [
                'sale_id' => $sale->id,
                'invoice_number' => $sale->invoice_number ?? null,
            ]);
        }
    }

    /**
     * Set the priority level of a kitchen order.
     */
    public function setPriority(Sale $sale, string $priority): Sale
    {
        $sale->update(['priority' => $priority]);

        return $sale->refresh();
    }

    /**
     * Assign a chef to a kitchen order (null clears the assignment).
     */
    public function assignChef(Sale $sale, ?int $chefUserId): Sale
    {
        $sale->update(['chef_user_id' => $chefUserId]);

        return $sale->refresh();
    }

    /**
     * List the kitchen staff (chef / kitchen_staff roles) available for assignment.
     *
     * @return Collection<int, User>
     */
    public function chefs(?int $restaurantId = null): Collection
    {
        $restaurantId = $restaurantId ?? getRestaurantId();

        $query = User::query()
            ->where(function ($q) {
                $q->whereHas('roles', function ($r) {
                    $r->whereIn('name', ['chef', 'kitchen_staff']);
                });
            })
            ->orderBy('name')
            ->limit(100);

        if ($restaurantId) {
            $query->where(function ($q) use ($restaurantId) {
                $q->where('restaurant_id', $restaurantId)
                    ->orWhereNull('restaurant_id');
            });
        }

        return $query->get(['id', 'name', 'restaurant_id']);
    }
}
