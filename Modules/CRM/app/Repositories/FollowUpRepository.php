<?php

namespace Modules\CRM\Repositories;

use Modules\CRM\Models\FollowUp;

class FollowUpRepository
{
    public function __construct(protected FollowUp $model) {}

    /**
     * Paginated follow-up list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['restaurant_id'] ?? null, fn ($q, $restaurantId) => $q->where('restaurant_id', $restaurantId))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['customer_id'] ?? null, fn ($q, $customerId) => $q->where('customer_id', $customerId))
            ->when($filters['assigned_to'] ?? null, fn ($q, $assignedTo) => $q->where('assigned_to', $assignedTo))
            ->with(['customer:id,name,phone', 'assignee:id,name'])
            ->orderByRaw('status = "pending" desc, due_at asc')
            ->paginate($perPage);
    }

    /**
     * Find a follow-up by id.
     */
    public function find(int $id): FollowUp
    {
        return $this->model->with(['customer:id,name,phone', 'assignee:id,name'])->findOrFail($id);
    }

    /**
     * Create a follow-up.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): FollowUp
    {
        return $this->model->create($data);
    }

    /**
     * Update a follow-up.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): FollowUp
    {
        $item = $this->find($id);
        $item->update($data);

        return $item;
    }

    /**
     * Mark a follow-up as completed.
     */
    public function complete(int $id): FollowUp
    {
        $item = $this->find($id);
        $item->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return $item;
    }

    /**
     * Delete a follow-up.
     */
    public function delete(int $id): bool
    {
        return (bool) $this->model->findOrFail($id)->delete();
    }
}
