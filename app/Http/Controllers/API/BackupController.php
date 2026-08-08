<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\BackupResource;
use App\Models\DatabaseBackup;
use App\Services\BackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class BackupController extends Controller
{
    public function __construct(protected BackupService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'view_backups');

        $filters = $request->only(['search']);

        $data = $this->service->paginate(
            (int) $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans('message.backups_fetched'),
            'data' => BackupResource::collection($data),
            'summary' => [
                'total' => DatabaseBackup::count(),
                'total_size' => (int) DatabaseBackup::sum('size'),
                'last_backup_at' => DatabaseBackup::latest('created_at')->value('created_at')?->toISOString(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'create_backups');

        try {
            $backup = $this->service->create($request->user());
        } catch (Throwable $e) {
            Log::error('Database backup creation failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'status' => 'error',
                'message' => trans('message.backup_create_failed'),
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('message.backup_created'),
            'data' => new BackupResource($backup),
        ], 201);
    }

    public function download(Request $request, DatabaseBackup $backup): BinaryFileResponse|JsonResponse
    {
        $this->authorizeAction($request, 'view_backups');

        $fullPath = $this->service->fullPath($backup);

        if (!file_exists($fullPath)) {
            return response()->json([
                'status' => 'error',
                'message' => trans('message.backup_file_missing'),
            ], 404);
        }

        return response()->download($fullPath, $backup->filename, [
            'Content-Type' => 'application/sql',
        ]);
    }

    public function restore(Request $request, DatabaseBackup $backup): JsonResponse
    {
        $this->authorizeAction($request, 'restore_backups');

        try {
            $this->service->restore($backup);
        } catch (Throwable $e) {
            Log::error('Database restore failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'status' => 'error',
                'message' => trans('message.backup_restore_failed'),
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('message.backup_restored'),
        ]);
    }

    public function restoreUpload(Request $request): JsonResponse
    {
        $this->authorizeAction($request, 'restore_backups');

        $request->validate([
            'file' => ['required', 'file', 'max:204800'],
        ]);

        try {
            $this->service->restoreFromUpload($request->file('file'));
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Database restore from upload failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'status' => 'error',
                'message' => trans('message.backup_restore_failed'),
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('message.backup_restored'),
        ]);
    }

    public function destroy(Request $request, DatabaseBackup $backup): JsonResponse
    {
        $this->authorizeAction($request, 'delete_backups');

        $this->service->destroy($backup);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.backup_deleted'),
        ]);
    }

    protected function authorizeAction(Request $request, string $permission): void
    {
        if (!$request->user()->can($permission)) {
            abort(403, 'Unauthorized');
        }
    }
}
