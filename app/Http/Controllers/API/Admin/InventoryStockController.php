<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryAdjustment;
use App\Models\InventoryAdjustmentItem;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\InventoryTransfer;
use App\Models\InventoryTransferItem;
use App\Models\InventoryWaste;
use App\Models\InventoryWasteItem;
use App\Services\StockService;
use Illuminate\Http\Request;

class InventoryStockController extends Controller
{
    public function __construct(protected StockService $stockService) {}

    /**
     * Stock overview / valuation.
     */
    public function overview(Request $request)
    {
        $restaurantId = getRestaurantId($request->user());

        $query = InventoryItem::with(['category:id,name', 'supplier:id,name']);
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%')
                    ->orWhere('barcode', 'like', '%' . $request->search . '%');
            });
        });

        $query->when($request->filled('type'), fn($q) => $q->where('type', $request->type));
        $query->when($request->filled('category_id'), fn($q) => $q->where('inventory_category_id', $request->category_id));
        $query->when($request->boolean('low_stock_only'), fn($q) => $q->lowStock());
        $query->when($request->boolean('expiring_only'), function ($q) {
            $q->whereHas('batches', fn($b) => $b->where('remaining_qty', '>', 0)->whereNotNull('expiry_date')->whereDate('expiry_date', '<=', now()->addDays(30)));
        });

        $items = $query->orderBy('name')->paginate($request->input('per_page', 15));

        $valuation = $this->stockService->valuation($restaurantId);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.stock_overview_fetched'),
            'data' => $items,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
            'summary' => $valuation,
        ]);
    }

    /**
     * Manual stock adjustment (increase/decrease).
     */
    public function adjustStock(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        $this->authorizeOwnership($item);

        $validated = $request->validate([
            'quantity' => 'required|numeric',
            'type' => 'nullable|in:purchase,sale,adjustment,waste,expired,return,consumption',
            'unit_cost' => 'nullable|numeric|min:0',
            'branch_id' => 'nullable|exists:branches,id',
            'notes' => 'nullable|string',
        ]);

        $transaction = $this->stockService->adjustStock(
            $item->id,
            (float) $validated['quantity'],
            $validated['type'] ?? 'adjustment',
            getRestaurantId($request->user()) ?? $item->restaurant_id,
            $validated['branch_id'] ?? null,
            null,
            null,
            $validated['notes'] ?? null,
            isset($validated['unit_cost']) ? (float) $validated['unit_cost'] : null
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.stock_adjusted'),
            'data' => $transaction->load('item'),
        ]);
    }

    /**
     * Transaction history.
     */
    public function transactions(Request $request)
    {
        $query = InventoryTransaction::with(['item:id,name,sku', 'branch:id,name', 'user:id,name']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('type'), fn($q) => $q->where('type', $request->type));
        $query->when($request->filled('item_id'), fn($q) => $q->where('item_id', $request->item_id));
        $query->when($request->filled('from'), fn($q) => $q->whereDate('created_at', '>=', $request->from));
        $query->when($request->filled('to'), fn($q) => $q->whereDate('created_at', '<=', $request->to));

        $transactions = $query->orderByDesc('id')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.stock_transactions_fetched'),
            'data' => $transactions,
        ]);
    }

    /**
     * Batches (expiry tracking).
     */
    public function batches(Request $request)
    {
        $query = InventoryBatch::with(['item:id,name,sku']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('item_id'), fn($q) => $q->where('item_id', $request->item_id));
        $query->when($request->boolean('expiring_only'), fn($q) => $q->where('remaining_qty', '>', 0)->whereNotNull('expiry_date')->whereDate('expiry_date', '<=', now()->addDays(30)));

        $batches = $query->orderBy('expiry_date')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $batches,
        ]);
    }

    /**
     * Inter-branch stock transfers.
     */
    public function transfers(Request $request)
    {
        $query = InventoryTransfer::with(['fromBranch:id,name', 'toBranch:id,name', 'items.item:id,name,sku', 'requester:id,name']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('status'), fn($q) => $q->where('status', $request->status));
        $query->when($request->filled('from_branch_id'), fn($q) => $q->where('from_branch_id', $request->from_branch_id));
        $query->when($request->filled('to_branch_id'), fn($q) => $q->where('to_branch_id', $request->to_branch_id));

        $transfers = $query->orderByDesc('id')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.transfers_fetched'),
            'data' => $transfers,
        ]);
    }

    public function storeTransfer(Request $request)
    {
        $validated = $request->validate([
            'from_branch_id' => 'required|exists:branches,id',
            'to_branch_id' => 'required|exists:branches,id|different:from_branch_id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $restaurantId = getRestaurantId($request->user());
        if (!$restaurantId) {
            return response()->json(['status' => 'error', 'message' => trans('message.restaurant_required')], 422);
        }

        $transfer = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $restaurantId) {
            $transfer = InventoryTransfer::create([
                'restaurant_id' => $restaurantId,
                'reference_number' => 'TRF-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4)),
                'from_branch_id' => $validated['from_branch_id'],
                'to_branch_id' => $validated['to_branch_id'],
                'status' => 'in_transit',
                'notes' => $validated['notes'] ?? null,
                'requested_by' => auth()->id() ?? 1,
            ]);

            foreach ($validated['items'] as $line) {
                InventoryTransferItem::create([
                    'transfer_id' => $transfer->id,
                    'item_id' => $line['item_id'],
                    'quantity' => $line['quantity'],
                ]);

                // Deduct from source branch stock
                $this->stockService->adjustStock(
                    $line['item_id'],
                    -1 * (float) $line['quantity'],
                    'transfer',
                    $restaurantId,
                    $validated['from_branch_id'],
                    $transfer->id,
                    InventoryTransfer::class,
                    'Transfer ' . $transfer->reference_number
                );
            }

            return $transfer;
        });

        return response()->json([
            'status' => 'success',
            'message' => trans('message.transfer_created'),
            'data' => $transfer->fresh(['items.item', 'fromBranch', 'toBranch']),
        ], 201);
    }

    public function receiveTransfer(Request $request, $id)
    {
        $transfer = InventoryTransfer::findOrFail($id);
        $this->authorizeOwnership($transfer);

        $validated = $request->validate([
            'items' => 'nullable|array',
            'items.*.item_id' => 'required|exists:inventory_items,id',
            'items.*.received_quantity' => 'required|numeric|min:0',
        ]);

        $transfer = \Illuminate\Support\Facades\DB::transaction(function () use ($transfer, $validated, $request) {
            $receivedMap = collect($validated['items'] ?? [])->keyBy('item_id');

            foreach ($transfer->items as $line) {
                $receivedQty = $receivedMap->has($line->item_id)
                    ? (float) $receivedMap[$line->item_id]['received_quantity']
                    : (float) $line->quantity;

                $line->update(['received_quantity' => $receivedQty]);

                $this->stockService->adjustStock(
                    $line->item_id,
                    $receivedQty,
                    'transfer',
                    $transfer->restaurant_id,
                    $transfer->to_branch_id,
                    $transfer->id,
                    InventoryTransfer::class,
                    'Received transfer ' . $transfer->reference_number
                );
            }

            $transfer->update([
                'status' => 'received',
                'received_by' => auth()->id() ?? 1,
                'received_at' => now(),
            ]);

            return $transfer;
        });

        return response()->json([
            'status' => 'success',
            'message' => trans('message.transfer_received'),
            'data' => $transfer->fresh(['items.item', 'fromBranch', 'toBranch']),
        ]);
    }

    /**
     * Waste / wastage registration.
     */
    public function wastes(Request $request)
    {
        $query = InventoryWaste::with(['branch:id,name', 'items.item:id,name,sku', 'user:id,name']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('type'), fn($q) => $q->where('type', $request->type));
        $query->when($request->filled('branch_id'), fn($q) => $q->where('branch_id', $request->branch_id));

        $wastes = $query->orderByDesc('id')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.wastes_fetched'),
            'data' => $wastes,
        ]);
    }

    public function storeWaste(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'type' => 'nullable|in:damage,expired,spillage,other',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'nullable|numeric|min:0',
        ]);

        $restaurantId = getRestaurantId($request->user());
        if (!$restaurantId) {
            return response()->json(['status' => 'error', 'message' => trans('message.restaurant_required')], 422);
        }

        $waste = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $restaurantId) {
            $totalQty = collect($validated['items'])->sum('quantity');
            $totalValue = 0;

            $waste = InventoryWaste::create([
                'restaurant_id' => $restaurantId,
                'reference_number' => 'WST-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4)),
                'branch_id' => $validated['branch_id'] ?? null,
                'type' => $validated['type'] ?? 'damage',
                'total_quantity' => $totalQty,
                'total_value' => 0,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'user_id' => auth()->id() ?? 1,
            ]);

            foreach ($validated['items'] as $line) {
                $item = InventoryItem::find($line['item_id']);
                $unitCost = (float) ($line['unit_cost'] ?? $item?->unit_cost ?? 0);
                $lineValue = round((float) $line['quantity'] * $unitCost, 2);
                $totalValue += $lineValue;

                InventoryWasteItem::create([
                    'waste_id' => $waste->id,
                    'item_id' => $line['item_id'],
                    'quantity' => $line['quantity'],
                    'unit_cost' => $unitCost,
                    'total_cost' => $lineValue,
                ]);

                $this->stockService->adjustStock(
                    $line['item_id'],
                    -1 * (float) $line['quantity'],
                    $validated['type'] === 'expired' ? 'expired' : 'waste',
                    $restaurantId,
                    $validated['branch_id'] ?? null,
                    $waste->id,
                    InventoryWaste::class,
                    'Waste ' . $waste->reference_number,
                    $unitCost
                );
            }

            $waste->update(['total_value' => $totalValue]);

            return $waste;
        });

        return response()->json([
            'status' => 'success',
            'message' => trans('message.waste_created'),
            'data' => $waste->fresh(['items.item', 'branch']),
        ], 201);
    }

    /**
     * Stock adjustments (stock take / corrections) with approval flow.
     */
    public function adjustments(Request $request)
    {
        $query = InventoryAdjustment::with(['branch:id,name', 'items.item:id,name,sku', 'requester:id,name']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('status'), fn($q) => $q->where('status', $request->status));
        $query->when($request->filled('type'), fn($q) => $q->where('type', $request->type));

        $adjustments = $query->orderByDesc('id')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.adjustments_fetched'),
            'data' => $adjustments,
        ]);
    }

    public function storeAdjustment(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'type' => 'nullable|in:stock_take,damaged,found,lost,correction',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,approved,rejected',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:inventory_items,id',
            'items.*.actual_stock' => 'required|numeric|min:0',
        ]);

        $restaurantId = getRestaurantId($request->user());
        if (!$restaurantId) {
            return response()->json(['status' => 'error', 'message' => trans('message.restaurant_required')], 422);
        }

        $adjustment = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $restaurantId) {
            $status = $validated['status'] ?? 'approved';
            $adjustment = InventoryAdjustment::create([
                'restaurant_id' => $restaurantId,
                'reference_number' => 'ADJ-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4)),
                'branch_id' => $validated['branch_id'] ?? null,
                'type' => $validated['type'] ?? 'stock_take',
                'total_quantity' => 0,
                'total_value' => 0,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => $status,
                'requested_by' => auth()->id() ?? 1,
                'approved_by' => $status === 'approved' ? auth()->id() : null,
                'approved_at' => $status === 'approved' ? now() : null,
            ]);

            $totalQty = 0;
            $totalValue = 0;

            foreach ($validated['items'] as $line) {
                $item = InventoryItem::find($line['item_id']);
                $systemStock = (float) $item->current_stock;
                $actualStock = (float) $line['actual_stock'];
                $difference = round($actualStock - $systemStock, 2);
                $unitCost = (float) $item->unit_cost;
                $lineValue = round(abs($difference) * $unitCost, 2);

                $totalQty += $difference;
                $totalValue += $lineValue;

                InventoryAdjustmentItem::create([
                    'adjustment_id' => $adjustment->id,
                    'item_id' => $line['item_id'],
                    'system_stock' => $systemStock,
                    'actual_stock' => $actualStock,
                    'difference' => $difference,
                    'unit_cost' => $unitCost,
                    'total_cost' => $lineValue,
                    'reason' => $line['reason'] ?? null,
                ]);

                if ($status === 'approved' && $difference != 0) {
                    $this->stockService->adjustStock(
                        $line['item_id'],
                        $difference,
                        'adjustment',
                        $restaurantId,
                        $validated['branch_id'] ?? null,
                        $adjustment->id,
                        InventoryAdjustment::class,
                        'Adjustment ' . $adjustment->reference_number,
                        $unitCost
                    );
                }
            }

            $adjustment->update([
                'total_quantity' => round($totalQty, 2),
                'total_value' => round($totalValue, 2),
            ]);

            return $adjustment;
        });

        return response()->json([
            'status' => 'success',
            'message' => trans('message.adjustment_created'),
            'data' => $adjustment->fresh(['items.item', 'branch']),
        ], 201);
    }

    public function approveAdjustment(Request $request, $id)
    {
        $adjustment = InventoryAdjustment::findOrFail($id);
        $this->authorizeOwnership($adjustment);

        if ($adjustment->status !== 'pending') {
            return response()->json(['status' => 'error', 'message' => trans('message.adjustment_not_pending')], 422);
        }

        $adjustment = \Illuminate\Support\Facades\DB::transaction(function () use ($adjustment) {
            foreach ($adjustment->items as $line) {
                if ((float) $line->difference == 0) {
                    continue;
                }
                $this->stockService->adjustStock(
                    $line->item_id,
                    (float) $line->difference,
                    'adjustment',
                    $adjustment->restaurant_id,
                    $adjustment->branch_id,
                    $adjustment->id,
                    InventoryAdjustment::class,
                    'Approved adjustment ' . $adjustment->reference_number,
                    (float) $line->unit_cost
                );
            }

            $adjustment->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            return $adjustment;
        });

        return response()->json([
            'status' => 'success',
            'message' => trans('message.adjustment_approved'),
            'data' => $adjustment->fresh(['items.item', 'branch']),
        ]);
    }

    protected function authorizeOwnership($model): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $model->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
