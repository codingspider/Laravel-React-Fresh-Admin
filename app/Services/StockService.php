<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Support\Facades\DB;

/**
 * Central service for all inventory stock movements.
 * Every stock change (purchase, sale, transfer, adjustment, waste,
 * consumption, return) flows through this service so current_stock,
 * transactions and batches stay consistent.
 */
class StockService
{
    /**
     * Adjust stock for a single inventory item.
     *
     * @param int $itemId
     * @param float $quantity signed quantity (+ for inflow, - for outflow)
     * @param string $type transaction type
     * @param int|null $restaurantId
     * @param int|null $branchId
     * @param int|null $referenceId
     * @param string|null $referenceType
     * @param string|null $notes
     * @param float|null $unitCost override cost used on inflow
     * @param array|null $batchData batch_number, manufacture_date, expiry_date (optional)
     * @return InventoryTransaction
     */
    public function adjustStock(
        int $itemId,
        float $quantity,
        string $type,
        ?int $restaurantId = null,
        ?int $branchId = null,
        ?int $referenceId = null,
        ?string $referenceType = null,
        ?string $notes = null,
        ?float $unitCost = null,
        ?array $batchData = null
    ): InventoryTransaction {
        return DB::transaction(function () use ($itemId, $quantity, $type, $restaurantId, $branchId, $referenceId, $referenceType, $notes, $unitCost, $batchData) {
            $item = InventoryItem::withTrashed()->findOrFail($itemId);

            $restaurantId = $restaurantId ?? getRestaurantId();
            $cost = $unitCost ?? (float) $item->unit_cost;
            $previousStock = (float) $item->current_stock;
            $newStock = max(0, $previousStock + $quantity);

            $item->current_stock = $newStock;
            $item->quantity = $newStock;
            $item->save();

            if ($quantity < 0 && $item->track_stock && $item->minimum_stock !== null
                && $newStock <= (float) $item->minimum_stock
                && $previousStock > (float) $item->minimum_stock
            ) {
                \Modules\Notification\Events\LowStockAlert::dispatch($item, $newStock, $restaurantId);
            }

            $transaction = InventoryTransaction::create([
                'restaurant_id' => $restaurantId,
                'item_id' => $itemId,
                'branch_id' => $branchId,
                'type' => $type,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'unit_cost' => $cost,
                'total_cost' => round(abs($quantity) * $cost, 2),
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'notes' => $notes,
                'user_id' => auth()->id() ?? 1,
            ]);

            $this->applyBatch($itemId, $quantity, $cost, $type, $batchData, $restaurantId);

            return $transaction;
        });
    }

    /**
     * Manage FIFO batches for inflow/outflow.
     */
    protected function applyBatch(int $itemId, float $quantity, float $cost, string $type, ?array $batchData, ?int $restaurantId): void
    {
        if ($quantity > 0) {
            if ($type === 'purchase' || ($batchData && !empty($batchData['batch_number']))) {
                InventoryBatch::create([
                    'restaurant_id' => $restaurantId,
                    'item_id' => $itemId,
                    'batch_number' => $batchData['batch_number'] ?? null,
                    'quantity' => $quantity,
                    'remaining_qty' => $quantity,
                    'unit_cost' => $cost,
                    'manufacture_date' => $batchData['manufacture_date'] ?? null,
                    'expiry_date' => $batchData['expiry_date'] ?? null,
                ]);
            }
            return;
        }

        // Outflow: consume oldest batches first (FIFO)
        $outQty = abs($quantity);
        $batches = InventoryBatch::where('item_id', $itemId)
            ->where('remaining_qty', '>', 0)
            ->orderBy('expiry_date')
            ->orderBy('created_at')
            ->get();

        foreach ($batches as $batch) {
            if ($outQty <= 0) {
                break;
            }
            $take = min((float) $batch->remaining_qty, $outQty);
            $batch->remaining_qty -= $take;
            $batch->save();
            $outQty -= $take;
        }
    }

    /**
     * Sync an item's unit_cost and opening/current stock at creation.
     */
    public function initializeItem(InventoryItem $item, array $data): InventoryItem
    {
        $item->current_stock = $item->current_stock ?? $data['opening_stock'] ?? 0;
        $item->quantity = $item->current_stock;
        $item->unit_cost = $data['unit_cost'] ?? $item->cost_price ?? 0;
        $item->save();
        return $item;
    }

    /**
     * Stock valuation summary across all items.
     */
    public function valuation(?int $restaurantId = null, ?int $branchId = null): array
    {
        $restaurantId = $restaurantId ?? getRestaurantId();

        $query = InventoryItem::query();
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $items = $query->get();
        $totalValue = 0;
        $totalCost = 0;
        $totalQty = 0;

        foreach ($items as $item) {
            $totalValue += (float) $item->current_stock * (float) $item->unit_cost;
            $totalCost += (float) $item->unit_cost;
            $totalQty += (float) $item->current_stock;
        }

        $lowStock = $query->clone()->lowStock()->count();

        return [
            'total_items' => $items->count(),
            'total_stock_value' => round($totalValue, 2),
            'total_stock_qty' => round($totalQty, 2),
            'low_stock_items' => $lowStock,
            'expiring_soon' => InventoryBatch::when($restaurantId, fn($q) => $q->where('restaurant_id', $restaurantId))
                ->when($branchId, fn($q, $b) => $q->where('branch_id', $b))
                ->where('remaining_qty', '>', 0)
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '<=', now()->addDays(30))
                ->count(),
        ];
    }

    /**
     * Restore stock (used when deleting GRNs/returns so users can re-enter).
     */
    public function reverse(InventoryTransaction $transaction): void
    {
        $this->adjustStock(
            $transaction->item_id,
            -1 * $transaction->quantity,
            'adjustment',
            $transaction->restaurant_id,
            $transaction->branch_id,
            null,
            null,
            'Reversed transaction #' . $transaction->id,
            (float) $transaction->unit_cost
        );
    }
}
