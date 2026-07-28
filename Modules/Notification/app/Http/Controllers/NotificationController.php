<?php

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Services\NotificationService;

class NotificationController extends Controller
{
    protected string $langKey = 'notification::module';

    public function __construct(protected NotificationService $service) {}

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
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validated();
        $data['restaurant_id'] = getRestaurantId() ?? $request->user()->id;

        $item = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.created'),
            'data' => $item,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => $item,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $item = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => $item,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $item = $this->service->find($id);
        if (getRestaurantId() && $item->restaurant_id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }
}
