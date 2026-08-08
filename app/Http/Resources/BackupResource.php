<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BackupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'filename' => $this->filename,
            'path' => $this->path,
            'size' => $this->size,
            'status' => $this->status,
            'type' => $this->type,
            'creator' => $this->whenLoaded('creator', function () {
                return $this->creator ? [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ] : null;
            }),
            'restored_at' => $this->restored_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
