<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function __construct(protected ActivityLogService $service) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('view_activity_logs')) {
            abort(403, 'Unauthorized');
        }

        $filters = $request->only(['action', 'method', 'status_code', 'search', 'date_from', 'date_to']);
        $filters['restaurant_id'] = getRestaurantId($request->user());

        $data = $this->service->paginate(
            (int) $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.activity_logs_fetched'),
            'data' => ActivityLogResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }
}
