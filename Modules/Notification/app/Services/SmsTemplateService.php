<?php

namespace Modules\Notification\Services;

use Illuminate\Support\Facades\Log;
use Modules\Notification\Models\SmsTemplate;

class SmsTemplateService
{
    /**
     * List templates for a restaurant branch, including the system-wide
     * default templates that apply to every branch.
     *
     * @return \Illuminate\Support\Collection<int, SmsTemplate>
     */
    public function forBranch(int $restaurantId, ?int $branchId = null)
    {
        $branchId = app(NotificationSettingService::class)->resolveBranchId($restaurantId, $branchId);

        return SmsTemplate::withoutGlobalScopes()
            ->where(function ($query) use ($restaurantId, $branchId) {
                $query->whereNull('restaurant_id')
                    ->orWhere(function ($scoped) use ($restaurantId, $branchId) {
                        $scoped->where('restaurant_id', $restaurantId)
                            ->where(function ($branchQuery) use ($branchId) {
                                $branchQuery->whereNull('branch_id')
                                    ->orWhere('branch_id', $branchId);
                            });
                    });
            })
            ->orderBy('channel')
            ->orderBy('name')
            ->get();
    }

    public function create(int $restaurantId, ?int $branchId, array $data): SmsTemplate
    {
        $branchId = app(NotificationSettingService::class)->resolveBranchId($restaurantId, $branchId);

        return SmsTemplate::create(array_merge($data, [
            'restaurant_id' => $restaurantId,
            'branch_id' => $branchId,
        ]));
    }

    public function update(int $restaurantId, ?int $branchId, int $id, array $data): SmsTemplate
    {
        $template = $this->findForBranch($restaurantId, $branchId, $id);

        $template->update($data);

        return $template->refresh();
    }

    public function delete(int $restaurantId, ?int $branchId, int $id): void
    {
        $this->findForBranch($restaurantId, $branchId, $id)->delete();
    }

    protected function findForBranch(int $restaurantId, ?int $branchId, int $id): SmsTemplate
    {
        $branchId = app(NotificationSettingService::class)->resolveBranchId($restaurantId, $branchId);

        return SmsTemplate::withoutGlobalScopes()
            ->where('restaurant_id', $restaurantId)
            ->where(fn ($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
            ->findOrFail($id);
    }

    /**
     * Replace {placeholder} tokens in a template body.
     */
    public function render(string $body, array $data = []): string
    {
        $search = [];
        $replace = [];

        foreach ($data as $key => $value) {
            $search[] = '{' . $key . '}';
            $replace[] = (string) $value;
        }

        return str_replace($search, $replace, $body);
    }
}
