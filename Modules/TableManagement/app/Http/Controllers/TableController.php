<?php

namespace Modules\TableManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\TableManagement\Http\Requests\StoreTableRequest;
use Modules\TableManagement\Http\Requests\UpdateTableRequest;
use Modules\TableManagement\Resources\TableResource;
use Modules\TableManagement\Services\TableService;
use Modules\Restaurant\Models\Restaurant;

class TableController extends Controller
{
    protected string $langKey = 'tablemanagement::module';

    public function __construct(protected TableService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'restaurant_id', 'branch_id', 'floor_id'])
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
        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;

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

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new TableResource($table),
        ]);
    }

    public function update(UpdateTableRequest $request, $id): JsonResponse
    {
        $table = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new TableResource($table),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
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
            'restaurant_id' => 'required|exists:restaurants,id',
            'branch_id' => 'required|exists:branches,id',
            'guest_count' => 'nullable|integer|min:1',
        ]);

        $tables = $this->service->getAvailable(
            $request->input('restaurant_id'),
            $request->input('branch_id'),
            $request->input('guest_count')
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => TableResource::collection($tables),
        ]);
    }
}
