<?php

namespace Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Inventory\Services\InventoryService;

class InventoryController extends Controller
{
    public function __construct(protected InventoryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status'])
        );
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $item = $this->service->create($request->validated());
        return response()->json(['status' => 'success', 'data' => $item], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);
        return response()->json(['status' => 'success', 'data' => $item]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = $this->service->update($id, $request->validated());
        return response()->json(['status' => 'success', 'data' => $item]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);
        return response()->json(['status' => 'success', 'message' => 'Deleted']);
    }
}
