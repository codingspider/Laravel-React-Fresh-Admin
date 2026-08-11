<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

/**
 * Logs every store, update or delete request (POST, PUT, PATCH, DELETE)
 * to the activity_logs table.
 *
 * The middleware captures the request metadata while handling the request
 * and writes the log row after the response has been sent to the client
 * (terminable middleware), so it adds no latency to the response.
 */
class LogActivity
{
    private const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'old_password',
        'new_password',
        'token',
        'api_token',
        '_token',
        'secret',
        'card_number',
        'cvv',
        'cvc',
        'pin',
    ];

    private const SKIP_PATH_SEGMENTS = [
        'login',
        'logout',
        'register',
        'forgot-password',
        'reset-password',
        'change-password',
        'password',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldLog($request)) {
            $request->attributes->set('_activity_log_pending', [
                'user_id' => $request->user()?->id,
                'restaurant_id' => $request->user()?->restaurant_id ?? $request->get('_restaurant_id'),
                'branch_id' => $request->user()?->branch_id,
                'action' => $this->resolveAction($request->method()),
                'method' => $request->method(),
                'path' => $request->path(),
                'route_name' => $request->route()?->getName(),
                'request_data' => $this->sanitize($request->all()),
                'ip_address' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 255),
            ]);
        }

        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $data = $request->attributes->get('_activity_log_pending');

        if (!$data) {
            return;
        }

        try {
            // The middleware runs in the global stack, before the route-level
            // auth middleware has resolved the user, so resolve it here instead
            // where the authenticated guard is already populated.
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user()
                ?? \Illuminate\Support\Facades\Auth::guard('web')->user()
                ?? $request->user();

            ActivityLog::create([
                ...$data,
                'user_id' => $user?->id,
                'restaurant_id' => $user ? getRestaurantId($user) : null,
                'branch_id' => $user?->branch_id,
                'description' => $this->buildDescription($data),
                'response_status' => $response->getStatusCode(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to write activity log: ' . $e->getMessage());
        }
    }

    private function shouldLog(Request $request): bool
    {
        if (!in_array($request->method(), self::WRITE_METHODS, true)) {
            return false;
        }

        $path = '/' . trim($request->path(), '/');

        if (str_starts_with($path, '/install')) {
            return false;
        }

        foreach (self::SKIP_PATH_SEGMENTS as $segment) {
            if (str_contains($path, '/' . $segment)) {
                return false;
            }
        }

        return true;
    }

    private function resolveAction(string $method): string
    {
        return match ($method) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
        };
    }

    /**
     * Builds a human readable description such as "Updated restaurant #5".
     */
    private function buildDescription(array $data): string
    {
        $segments = array_values(array_filter(explode('/', trim($data['path'], '/')), fn ($s) => $s !== ''));

        if (($segments[0] ?? '') === 'api') {
            array_shift($segments);
        }

        $id = null;
        $last = array_pop($segments) ?? 'record';

        if (ctype_digit($last)) {
            $id = $last;
            $last = array_pop($segments) ?? 'record';
        }

        $entity = Str::singular(str_replace('-', ' ', $last));

        $verb = match ($data['action']) {
            'update' => 'Updated',
            'delete' => 'Deleted',
            default => 'Created',
        };

        return $id ? "{$verb} {$entity} #{$id}" : "{$verb} {$entity}";
    }

    private function sanitize(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            $key = (string) $key;

            if (str_starts_with($key, '_')) {
                continue;
            }

            if (in_array(strtolower($key), self::SENSITIVE_KEYS, true)) {
                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize($value);
            } elseif ($value instanceof UploadedFile) {
                $sanitized[$key] = [
                    'file' => $value->getClientOriginalName(),
                    'size' => $value->getSize(),
                ];
            } elseif (is_string($value)) {
                $sanitized[$key] = $this->scrubString($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    private function scrubString(string $value): string
    {
        if (str_starts_with($value, 'data:') && str_contains($value, 'base64')) {
            return '[base64 data omitted]';
        }

        if (strlen($value) > 1000) {
            return substr($value, 0, 1000) . '…[truncated]';
        }

        return $value;
    }
}
