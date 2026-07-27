<?php

namespace Modules\Recipe\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Recipe\Services\RecipeService;

class RecipeController extends Controller
{
    protected string $langKey = 'recipe::module';

    public function __construct(protected RecipeService $service) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'status'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $item,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $item,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $item,
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
