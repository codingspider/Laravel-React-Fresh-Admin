<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'method' => $this->method,
            'path' => $this->path,
            'route_name' => $this->route_name,
            'description' => $this->description,
            'request_data' => $this->request_data,
            'response_status' => $this->response_status,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'user' => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ] : null;
            }),
            'branch' => $this->whenLoaded('branch', function () {
                return $this->branch ? [
                    'id' => $this->branch->id,
                    'name' => $this->branch->name,
                ] : null;
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
