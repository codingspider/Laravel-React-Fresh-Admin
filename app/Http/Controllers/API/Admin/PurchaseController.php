<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceivedNote;
use App\Models\Purchase;
use App\Models\PurchasePayment;
use App\Models\PurchaseReturn;
use App\Services\PurchaseService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(protected PurchaseService $service) {}

    public function index(Request $request)
    {
        $query = Purchase::with(['supplier:id,name', 'branch:id,name', 'items']);

        $restaurantId = getRestaurantId($request->user());
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('reference_number', 'like', '%' . $request->search . '%')
                    ->orWhere('invoice_number', 'like', '%' . $request->search . '%');
            });
        });

        $query->when($request->filled('supplier_id'), fn($q) => $q->where('supplier_id', $request->supplier_id));
        $query->when($request->filled('branch_id'), fn($q) => $q->where('branch_id', $request->branch_id));
        $query->when($request->filled('order_type'), fn($q) => $q->where('order_type', $request->order_type));
        $query->when($request->filled('status'), fn($q) => $q->where('status', $request->status));

        $query->when($request->boolean('pending_only'), fn($q) => $q->whereRaw('paid_amount < total'));

        $purchases = $query->orderByDesc('id')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.purchases_fetched'),
            'data' => $purchases,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePurchase($request);
        $validated['restaurant_id'] = getRestaurantId($request->user()) ?? $request->user()->restaurant_id;

        $purchase = $this->service->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.purchase_created'),
            'data' => $purchase,
        ], 201);
    }

    public function show($id)
    {
        $purchase = Purchase::with([
            'supplier:id,name,company,phone,email',
            'branch:id,name',
            'items.inventoryItem:id,name,sku,unit',
            'goodsReceivedNotes.items.inventoryItem:id,name',
            'payments',
            'returns.items.inventoryItem:id,name',
        ])->findOrFail($id);

        $this->authorizeOwnership($purchase);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.purchase_fetched'),
            'data' => $purchase,
        ]);
    }

    public function update(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $validated = $this->validatePurchase($request);
        $purchase = $this->service->update($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.purchase_updated'),
            'data' => $purchase,
        ]);
    }

    public function destroy($id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.purchase_deleted'),
        ]);
    }

    /**
     * Receive goods for a purchase (GRN).
     */
    public function receiveGoods(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $validated = $request->validate([
            'grn_number' => 'nullable|string|max:255',
            'received_date' => 'nullable|date',
            'status' => 'nullable|in:pending,partial,completed,rejected',
            'notes' => 'nullable|string',
            'storage_location' => 'nullable|string',
            'checked_by' => 'nullable|exists:users,id',
            'items' => 'required|array',
            'items.*.purchase_item_id' => 'required|exists:purchase_items,id',
            'items.*.received_quantity' => 'nullable|numeric|min:0',
            'items.*.rejected_quantity' => 'nullable|numeric|min:0',
            'items.*.unit_cost' => 'nullable|numeric|min:0',
            'items.*.batch_number' => 'nullable|string|max:255',
            'items.*.manufacture_date' => 'nullable|date',
            'items.*.expiry_date' => 'nullable|date',
            'items.*.notes' => 'nullable|string',
        ]);

        $validated['restaurant_id'] = $purchase->restaurant_id;
        $grn = $this->service->receiveGoods($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.grn_created'),
            'data' => $grn,
        ], 201);
    }

    /**
     * Record a payment against a purchase.
     */
    public function addPayment(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $validated = $request->validate([
            'payment_number' => 'nullable|string|max:255',
            'payment_date' => 'nullable|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|in:cash,bank_transfer,cheque,card,other',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,failed',
        ]);

        $validated['restaurant_id'] = $purchase->restaurant_id;
        $payment = $this->service->recordPayment($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.payment_created'),
            'data' => $payment,
        ], 201);
    }

    /**
     * Create a return / debit note.
     */
    public function createReturn(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $validated = $request->validate([
            'return_number' => 'nullable|string|max:255',
            'return_date' => 'nullable|date',
            'type' => 'nullable|in:return,debit_note',
            'status' => 'nullable|in:pending,approved,rejected,completed',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array',
            'items.*.purchase_item_id' => 'nullable|exists:purchase_items,id',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'nullable|numeric|min:0',
            'items.*.reason' => 'nullable|string',
        ]);

        $validated['restaurant_id'] = $purchase->restaurant_id;
        $return = $this->service->createReturn($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.purchase_return_created'),
            'data' => $return,
        ], 201);
    }

    public function payments(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $payments = PurchasePayment::where('purchase_id', $id)->orderByDesc('id')->get();

        return response()->json([
            'status' => 'success',
            'data' => $payments,
        ]);
    }

    public function returns(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $this->authorizeOwnership($purchase);

        $returns = PurchaseReturn::with('items.inventoryItem:id,name')
            ->where('purchase_id', $id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $returns,
        ]);
    }

    protected function validatePurchase(Request $request): array
    {
        return $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'nullable|exists:branches,id',
            'reference_number' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'expected_delivery_date' => 'nullable|date',
            'order_type' => 'nullable|in:purchase_order,direct_purchase',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'items' => 'required|array',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);
    }

    protected function authorizeOwnership(Purchase $purchase): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $purchase->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
