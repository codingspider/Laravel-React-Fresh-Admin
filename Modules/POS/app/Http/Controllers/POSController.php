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
use Modules\Restaurant\Models\Restaurant;

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
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $session = $this->posService->startSession([
            'restaurant_id' => $restaurant?->id ?? $request->user()->id,
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
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
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
        $data = $this->saleRepo->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'payment_status', 'order_type', 'restaurant_id', 'branch_id', 'date', 'from_date', 'to_date'])
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
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $data = $request->validated();
        $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;
        $data['branch_id'] = $data['branch_id'] ?? $request->input('branch_id');
        $data['user_id'] = $request->user()->id;

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
