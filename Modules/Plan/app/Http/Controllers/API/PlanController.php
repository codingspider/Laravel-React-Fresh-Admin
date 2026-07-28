<?php

namespace Modules\Plan\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Plan\Http\Requests\StorePlanRequest;
use Modules\Plan\Http\Requests\UpdatePlanRequest;
use Modules\Plan\Resources\PlanResource;
use Modules\Plan\Services\PlanService;

class PlanController extends Controller
{
    protected string $langKey = 'plan::module';

    public function __construct(protected PlanService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status', 'billing_cycle'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => PlanResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StorePlanRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $packageIds = $validated['package_ids'] ?? [];
        unset($validated['package_ids']);

        $item = $this->service->create($validated);

        if (!empty($packageIds)) {
            $item->packages()->sync($packageIds);
        }

        $item->load('packages');

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new PlanResource($item),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);
        $item->load('packages');

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new PlanResource($item),
        ]);
    }

    public function update(UpdatePlanRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        $packageIds = $validated['package_ids'] ?? null;
        unset($validated['package_ids']);

        $item = $this->service->update($id, $validated);

        if ($packageIds !== null) {
            $item->packages()->sync($packageIds);
        }

        $item->load('packages');

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new PlanResource($item),
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
}
