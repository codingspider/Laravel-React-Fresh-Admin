<?php

namespace Modules\TableManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\TableManagement\Http\Requests\StoreReservationRequest;
use Modules\TableManagement\Http\Requests\UpdateReservationRequest;
use Modules\TableManagement\Resources\ReservationResource;
use Modules\TableManagement\Services\ReservationService;

class ReservationController extends Controller
{
    protected string $langKey = 'reservation::module';

    public function __construct(protected ReservationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'branch_id', 'date']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => ReservationResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

        if (!empty($data['table_id'])) {
            $table = \Modules\TableManagement\Models\Table::withoutGlobalScopes()->find($data['table_id']);
            if (!$table || (getRestaurantId() && $table->restaurant_id != getRestaurantId())) {
                abort(403, 'Unauthorized');
            }
        }

        $reservation = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new ReservationResource($reservation),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        if (getRestaurantId() && $reservation->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function update(UpdateReservationRequest $request, $id): JsonResponse
    {
        $reservation = $this->service->find($id);
        if (getRestaurantId() && $reservation->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $reservation = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        if (getRestaurantId() && $reservation->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    private function authorizeRestaurantAccess(object $reservation): void
    {
        if (getRestaurantId() && $reservation->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }
    }

    public function confirm($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        $this->authorizeRestaurantAccess($reservation);

        $reservation = $this->service->confirm($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('reservation::module.reservation_confirmed'),
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function cancel($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        $this->authorizeRestaurantAccess($reservation);

        $reservation = $this->service->cancel($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('reservation::module.reservation_cancelled'),
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function seat($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        $this->authorizeRestaurantAccess($reservation);

        $reservation = $this->service->seat($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.status_changed'),
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function complete($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        $this->authorizeRestaurantAccess($reservation);

        $reservation = $this->service->complete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.status_changed'),
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function noShow($id): JsonResponse
    {
        $reservation = $this->service->find($id);
        $this->authorizeRestaurantAccess($reservation);

        $reservation = $this->service->noShow($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('reservation::module.no_show'),
            'data' => new ReservationResource($reservation),
        ]);
    }
}
