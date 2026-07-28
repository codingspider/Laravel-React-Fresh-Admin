<?php

namespace Modules\Subscription\Repositories;

use Modules\Subscription\Models\Subscription;

class SubscriptionRepository
{
    public function __construct(protected Subscription $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Subscription
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Subscription
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Subscription
    {
        $item = $this->find($id);
        $item->update($data);
        return $item;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model
            ->with(['restaurant', 'plan'])
            ->when($filters['scope_restaurant_id'] ?? null, fn ($q, $rid) => $q->where('restaurant_id', $rid))
            ->when($filters['restaurant_id'] ?? null, fn ($q, $rid) => $q->where('restaurant_id', $rid))
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->whereHas('restaurant', function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%");
            }))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['payment_status'] ?? null, fn ($q, $ps) => $q->where('payment_status', $ps))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
