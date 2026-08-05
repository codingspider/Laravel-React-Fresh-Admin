<?php

namespace Modules\TableManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\TableManagement\Http\Requests\StoreTableRequest;
use Modules\TableManagement\Http\Requests\UpdateTableRequest;
use Modules\TableManagement\Resources\TableResource;
use Modules\TableManagement\Services\TableService;

class TableController extends Controller
{
    protected string $langKey = 'tablemanagement::module';

    public function __construct(protected TableService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'branch_id', 'floor_id']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => TableResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreTableRequest $request): JsonResponse
    {
        $data = $request->validated();

        $restaurantId = $request->input('restaurant_id') ?? getRestaurantId();
        if (!$restaurantId && !empty($data['floor_id'])) {
            $restaurantId = \Modules\TableManagement\Models\Floor::where('id', $data['floor_id'])->value('restaurant_id');
        }

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.restaurant_required'),
            ], 422);
        }

        $data['restaurant_id'] = $restaurantId;

        $table = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new TableResource($table),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $table = $this->service->find($id);
        if (getRestaurantId() && $table->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new TableResource($table),
        ]);
    }

    public function update(UpdateTableRequest $request, $id): JsonResponse
    {
        $table = $this->service->find($id);
        if (getRestaurantId() && $table->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $table = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new TableResource($table),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $table = $this->service->find($id);
        if (getRestaurantId() && $table->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $table = $this->service->find($id);
        if (getRestaurantId() && $table->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $request->validate(['status' => 'required|in:available,reserved,occupied,billing,cleaning']);
        $table = $this->service->updateStatus($id, $request->input('status'));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.status_changed'),
            'data' => new TableResource($table),
        ]);
    }

    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'guest_count' => 'nullable|integer|min:1',
        ]);

        $restaurantId = getRestaurantId();
        if (!$restaurantId) {
            abort(403, 'Unauthorized');
        }

        $tables = $this->service->getAvailable(
            $restaurantId,
            $request->input('branch_id'),
            $request->input('guest_count')
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => TableResource::collection($tables),
        ]);
    }

    public function regenerateQr($id): JsonResponse
    {
        $table = $this->service->find($id);
        if (getRestaurantId() && $table->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $table->qr_token = generateQrToken();
        $table->qr_code_url = url("/order?table={$table->qr_token}");
        $table->save();

        $qrImage = saveQrCodeFile($table);
        if ($qrImage) {
            $table->update(['qr_image' => $qrImage]);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.qr_regenerated'),
            'data' => [
                'qr_token' => $table->qr_token,
                'qr_url' => $table->qr_url,
                'qr_code_url' => $table->qr_code_url,
                'qr_image' => $table->qr_image,
                'qr_svg' => generateQrCode($table),
            ],
        ]);
    }

    public function qrCode($id): JsonResponse
    {
        $table = $this->service->find($id);
        if (getRestaurantId() && $table->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        if (!$table->qr_image) {
            $qrImage = saveQrCodeFile($table);
            if ($qrImage) {
                $table->update(['qr_image' => $qrImage]);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'qr_token' => $table->qr_token,
                'qr_url' => $table->qr_url,
                'qr_code_url' => $table->qr_code_url,
                'qr_image' => $table->qr_image,
                'qr_svg' => generateQrCode($table),
            ],
        ]);
    }
}
