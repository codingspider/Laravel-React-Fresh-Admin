<?php

namespace Modules\Accounting\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class JournalEntryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'account_id' => $this->account_id,
            'account' => $this->whenLoaded('account', function () {
                return [
                    'id' => $this->account->id,
                    'code' => $this->account->code,
                    'name' => $this->account->name,
                    'type' => $this->account->type,
                    'account_group' => $this->account->account_group,
                ];
            }),
            'related_id' => $this->related_id,
            'related_type' => $this->related_type,
            'reference_number' => $this->reference_number,
            'voucher_number' => $this->voucher_number,
            'entry_type' => $this->entry_type,
            'amount' => $this->amount,
            'entry_date' => $this->entry_date?->format('Y-m-d'),
            'description' => $this->description,
            'source_module' => $this->source_module,
            'branch_id' => $this->branch_id,
            'branch' => $this->whenLoaded('branch', function () {
                return [
                    'id' => $this->branch->id,
                    'name' => $this->branch->name,
                ];
            }),
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
