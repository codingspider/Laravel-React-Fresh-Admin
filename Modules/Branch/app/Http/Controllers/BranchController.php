<?php

namespace Modules\Branch\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Http\Requests\StoreBranchRequest;
use Modules\Branch\Http\Requests\UpdateBranchRequest;
use Modules\Branch\Resources\BranchResource;
use Modules\Branch\Services\BranchService;

class BranchController extends Controller
{
    protected string $langKey = 'branch::module';

    public function __construct(protected BranchService $service) {}

    public function options(): JsonResponse
    {
        $branches = $this->service->query()
            ->where('restaurant_id', getRestaurantId())
            ->get(['id', 'restaurant_id', 'name', 'is_main']);

        return response()->json([
            'status' => 'success',
            'data' => $branches,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status']);
        $filters['restaurant_id'] = getRestaurantId();

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => BranchResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

        $branch = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new BranchResource($branch),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $branch = $this->service->find($id);
        if (getRestaurantId() && $branch->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new BranchResource($branch),
        ]);
    }

    public function update(UpdateBranchRequest $request, $id): JsonResponse
    {
        $branch = $this->service->find($id);
        if (getRestaurantId() && $branch->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $branch = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new BranchResource($branch),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $branch = $this->service->find($id);
        if (getRestaurantId() && $branch->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
