<?php

namespace Modules\SuperAdmin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\SuperAdmin\Services\StripeSettingService;

class StripeSettingController extends Controller
{
    public function __construct(protected StripeSettingService $service) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->service->all(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'test_mode' => 'nullable|boolean',
            'test_secret_key' => 'nullable|string|max:255',
            'test_publishable_key' => 'nullable|string|max:255',
            'live_secret_key' => 'nullable|string|max:255',
            'live_publishable_key' => 'nullable|string|max:255',
            'webhook_secret' => 'nullable|string|max:255',
            'enabled' => 'nullable|boolean',
            'capture_method' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid input.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->service->update($request->only(array_keys($this->service->defaults())));

        return response()->json([
            'status' => 'success',
            'message' => 'Stripe settings saved.',
            'data' => $this->service->all(),
        ]);
    }
}
