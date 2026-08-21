<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class InventoryItemController extends Controller
{
    private function inventoryPayload(array $data, ?InventoryItem $item = null): array
    {
        $image = $item?->image;

        if (request()->hasFile('image')) {
            $image = uploadImage(
                request()->file('image'),
                'uploads/inventory/image',
                $image
            );
        }

        return [
            'restaurant_id' => $data['restaurant_id'] ?? $item?->restaurant_id,
            'branch_id' => $data['branch_id'] ?? null,
            'inventory_category_id' => $data['inventory_category_id'] ?? null,
            'supplier_id' => $data['supplier_id'] ?? null,
            'name' => $data['name'],
            'sku' => $data['sku'] ?? $item?->sku ?? 'SKU-' . time(),
            'description' => $data['description'] ?? null,
            'unit' => $data['unit'] ?? 'piece',
            'quantity' => $data['quantity'] ?? 0,
            'reorder_level' => $data['reorder_level'] ?? 0,
            'cost_price' => $data['cost_price'] ?? 0,
            'supplier_name' => $data['supplier_name'] ?? null,
            'image' => $image,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'status' => !empty($data['is_active']) ? 'active' : 'inactive',
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'inventory_category_id' => 'nullable|exists:inventory_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'quantity' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            $validated['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

            $item = InventoryItem::create($this->inventoryPayload($validated));

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => trans('message.inventory_item_created'),
                'data' => $item->fresh(['branch', 'category', 'supplier']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = InventoryItem::with(['branch:id,name', 'category:id,name', 'supplier:id,name']);

        $restaurantId = getRestaurantId();
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        });

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('inventory_category_id')) {
            $query->where('inventory_category_id', $request->inventory_category_id);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $items = $query->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_fetched_list'),
            'data' => $items,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $item = InventoryItem::with(['branch:id,name', 'category:id,name', 'supplier:id,name'])->findOrFail($id);
        $this->authorizeRestaurant($item->restaurant_id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_item_fetched'),
            'data' => $item,
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        $this->authorizeRestaurant($item->restaurant_id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'inventory_category_id' => 'nullable|exists:inventory_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'quantity' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'sometimes|boolean',
        ]);

        DB::beginTransaction();
        try {
            $item->update($this->inventoryPayload($validated, $item));

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => trans('message.inventory_item_updated'),
                'data' => $item->fresh(['branch', 'category', 'supplier']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $this->authorizeRestaurant($item->restaurant_id);
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.inventory_item_deleted'),
        ]);
    }

    protected function authorizeRestaurant(?int $restaurantId): void
    {
        if (getRestaurantId() && $restaurantId != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }
    }
}
