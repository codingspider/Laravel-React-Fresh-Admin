<?php

namespace Modules\SuperAdmin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\SuperAdmin\Services\FaqService;

class FaqController extends Controller
{
    protected string $langKey = 'superadmin::module';

    public function __construct(protected FaqService $service) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $this->service->active(),
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        if (! isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $request->only(['search', 'is_active'])
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (! isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:500',
            'answer' => 'required|string|max:5000',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.invalid_input'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $item = $this->service->create($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.faq_created'),
            'data' => $item,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        if (! isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $item = $this->service->find($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $item,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        if (! isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'question' => 'sometimes|required|string|max:500',
            'answer' => 'sometimes|required|string|max:5000',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.invalid_input'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $item = $this->service->update($id, $validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.faq_updated'),
            'data' => $item,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        if (! isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.forbidden'),
            ], 403);
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.faq_deleted'),
        ]);
    }
}
