<?php

namespace Modules\Currency\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Currency\Http\Requests\StoreCurrencyRequest;
use Modules\Currency\Http\Requests\UpdateCurrencyRequest;
use Modules\Currency\Resources\CurrencyResource;
use Modules\Currency\Services\CurrencyService;

class CurrencyController extends Controller
{
    protected string $langKey = 'currency::module';

    public function __construct(protected CurrencyService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'is_active'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => CurrencyResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function allActive(): JsonResponse
    {
        $data = $this->service->allActive();

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => CurrencyResource::collection($data),
        ]);
    }

    public function store(StoreCurrencyRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => new CurrencyResource($item),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new CurrencyResource($item),
        ]);
    }

    public function update(UpdateCurrencyRequest $request, $id): JsonResponse
    {
        $item = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new CurrencyResource($item),
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
