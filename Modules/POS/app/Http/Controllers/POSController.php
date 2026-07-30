<?php

namespace Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\POS\Http\Requests\StoreSaleRequest;
use Modules\POS\Http\Requests\ProcessPaymentRequest;
use Modules\POS\Http\Requests\StartSessionRequest;
use Modules\POS\Http\Requests\CloseSessionRequest;
use Modules\POS\Resources\PosSessionResource;
use Modules\POS\Resources\SaleResource;
use Modules\POS\Services\PosService;
use Modules\POS\Repositories\PosSessionRepository;
use Modules\POS\Repositories\SaleRepository;

class POSController extends Controller
{
    protected string $langKey = 'pos::module';

    public function __construct(
        protected PosService $posService,
        protected PosSessionRepository $sessionRepo,
        protected SaleRepository $saleRepo,
    ) {}

    // --- SESSIONS ---

    public function startSession(StartSessionRequest $request): JsonResponse
    {
        $session = $this->posService->startSession([
            'restaurant_id' => getRestaurantId() ?? $request->user()->id,
            'branch_id' => $request->branch_id,
            'user_id' => $request->user()->id,
            'opening_balance' => $request->opening_balance,
            'notes' => $request->notes,
            'status' => 'open',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new PosSessionResource($session),
        ], 201);
    }

    public function closeSession(CloseSessionRequest $request, $id): JsonResponse
    {
        $session = $this->posService->closeSession($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new PosSessionResource($session),
        ]);
    }

    public function getOpenSession(Request $request): JsonResponse
    {
        $session = $this->sessionRepo->getOpenSession(
            $request->input('branch_id', 1),
            $request->user()->id
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $session ? new PosSessionResource($session) : null,
        ]);
    }

    // --- SALES ---

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'payment_status', 'order_type', 'branch_id', 'date', 'from_date', 'to_date']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->saleRepo->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => SaleResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreSaleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;
        $data['branch_id'] = $data['branch_id'] ?? $request->input('branch_id');
        $data['user_id'] = $request->user()->id;

        if (isset($data['discount_type']) && isset($data['discount_value'])) {
            $val = (float) ($data['discount_value'] ?? 0);
            if ($data['discount_type'] === 'percent') {
                $data['discount_percent'] = $val;
                $data['discount_amount'] = 0;
            } else {
                $data['discount_amount'] = $val;
                $data['discount_percent'] = 0;
            }
        }

        $data['delivery_charge'] = $data['shipping'] ?? $data['delivery_charge'] ?? 0;

        if (isset($data['tax_rate'])) {
            $data['tax_percent'] = (float) $data['tax_rate'];
        }

        unset($data['discount_type'], $data['discount_value'], $data['shipping'], $data['tax_rate'], $data['tax_name']);

        $sale = $this->posService->createSale($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new SaleResource($sale),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $sale = $this->saleRepo->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function processPayment(ProcessPaymentRequest $request, $saleId): JsonResponse
    {
        $sale = $this->saleRepo->find($saleId);
        $sale = $this->posService->processPayment($sale, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.success'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function holdOrder($id): JsonResponse
    {
        $sale = $this->posService->holdOrder($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function recallOrder($id): JsonResponse
    {
        $sale = $this->posService->recallOrder($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function cancelSale($id): JsonResponse
    {
        $sale = $this->posService->cancelSale($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function getHeldOrders(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();
        $branchId = $request->input('branch_id');

        $query = \Modules\POS\Models\Sale::where('status', 'pending')
            ->where('restaurant_id', $restaurantId)
            ->with(['items.menuItem', 'customer', 'table']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $held = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => SaleResource::collection($held),
        ]);
    }

    public function mergeBills(Request $request): JsonResponse
    {
        $request->validate([
            'sale_ids' => 'required|array|min:2',
            'sale_ids.*' => 'required|exists:sales,id',
        ]);

        $saleIds = $request->input('sale_ids');
        $restaurantId = getRestaurantId();

        $sales = \Modules\POS\Models\Sale::whereIn('id', $saleIds)
            ->where('restaurant_id', $restaurantId)
            ->where('status', 'pending')
            ->with('items')
            ->get();

        if ($sales->count() < 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Need at least 2 held orders to merge',
            ], 422);
        }

        $firstSale = $sales->first();
        $allItems = [];
        $totalDiscount = 0;
        $totalTax = 0;

        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                $allItems[] = [
                    'menu_item_id' => $item->menu_item_id,
                    'item_name' => $item->item_name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_amount' => $item->discount_amount,
                    'tax_amount' => $item->tax_amount,
                    'total' => $item->total,
                    'kitchen_notes' => $item->kitchen_notes,
                ];
            }
            $totalDiscount += $sale->discount_amount ?? 0;
            $totalTax += $sale->tax_amount ?? 0;
        }

        $subtotal = array_sum(array_column($allItems, 'total'));

        $firstSale->update([
            'subtotal' => $subtotal,
            'discount_amount' => $totalDiscount,
            'tax_amount' => $totalTax,
            'total' => $subtotal - $totalDiscount + $totalTax,
        ]);

        $firstSale->items()->delete();
        foreach ($allItems as $itemData) {
            $firstSale->items()->create($itemData);
        }

        $otherSaleIds = $sales->pluck('id')->filter(fn($id) => $id !== $firstSale->id)->toArray();
        \Modules\POS\Models\Payment::whereIn('sale_id', $otherSaleIds)->delete();
        \Modules\POS\Models\Sale::whereIn('id', $otherSaleIds)->delete();

        $firstSale->load(['items.menuItem', 'customer', 'table']);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new SaleResource($firstSale),
        ]);
    }

    public function processMultiplePayments(Request $request, $saleId): JsonResponse
    {
        $request->validate([
            'payments' => 'required|array|min:1',
            'payments.*.payment_method' => 'required|in:cash,card,upi,online,credit,loyalty,gift_card,other',
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.reference_number' => 'nullable|string|max:255',
            'payments.*.notes' => 'nullable|string|max:255',
        ]);

        $sale = $this->saleRepo->find($saleId);

        foreach ($request->payments as $paymentData) {
            $this->posService->processPayment($sale->fresh(), $paymentData);
        }

        $sale = $this->saleRepo->find($saleId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.success'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function processRefund(Request $request, $saleId): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,upi,online,credit,loyalty,gift_card,other',
            'refund_reason' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        $sale = $this->saleRepo->find($saleId);
        $sale = $this->posService->processRefund($sale, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new SaleResource($sale),
        ]);
    }

    public function addItem(Request $request, $saleId): JsonResponse
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $sale = $this->saleRepo->find($saleId);
        $this->posService->addItemsToSale($sale, [$request->validated()]);
        $this->posService->recalculateSale($sale->fresh());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new SaleResource($sale->fresh(['items.menuItem', 'payments'])),
        ]);
    }

    public function removeItem($saleId, $itemId): JsonResponse
    {
        $this->posService->removeSaleItem($saleId, $itemId);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
            'data' => new SaleResource($this->saleRepo->find($saleId)),
        ]);
    }
}
