<?php

namespace Modules\GuestOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\GuestOrder\Http\Requests\StoreGuestOrderRequest;
use Modules\GuestOrder\Services\GuestOrderService;

class GuestOrderController extends Controller
{
    public function __construct(protected GuestOrderService $service) {}

    public function store(StoreGuestOrderRequest $request): JsonResponse
    {
        $sale = $this->service->placeOrder($request->only([
            'restaurant_id', 'branch_id', 'table_id', 'items', 'notes',
            'guest_name', 'guest_phone',
        ]));

        return response()->json([
            'status' => 'success',
            'message' => trans('guestorder::module.order_placed'),
            'data' => [
                'invoice_number' => $sale->invoice_number,
                'total' => (float) $sale->total,
                'status' => $sale->status,
                'guest_name' => $sale->guest_name,
                'guest_phone' => $sale->guest_phone,
                'items' => $sale->items->map(fn ($item) => [
                    'name' => $item->item_name,
                    'quantity' => $item->quantity,
                    'total' => (float) $item->total,
                ]),
                'table' => $sale->table ? $sale->table->name : null,
            ],
        ], 201);
    }

    public function track(string $invoice): JsonResponse
    {
        $sale = $this->service->trackOrder($invoice);

        if (!$sale) {
            return response()->json([
                'status' => 'error',
                'message' => trans('guestorder::module.order_not_found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'invoice_number' => $sale->invoice_number,
                'status' => $sale->status,
                'subtotal' => (float) $sale->subtotal,
                'tax_amount' => (float) $sale->tax_amount,
                'tax_percent' => (float) $sale->tax_percent,
                'total' => (float) $sale->total,
                'payment_status' => $sale->payment_status,
                'order_type' => $sale->order_type,
                'guest_name' => $sale->guest_name,
                'guest_phone' => $sale->guest_phone,
                'notes' => $sale->notes,
                'table' => $sale->table ? $sale->table->name : null,
                'items' => $sale->items->map(fn ($item) => [
                    'name' => $item->item_name,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'tax_amount' => (float) $item->tax_amount,
                    'total' => (float) $item->total,
                    'modifiers' => $item->modifiers,
                    'notes' => $item->notes,
                ]),
            ],
        ]);
    }
}
