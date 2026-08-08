<?php

namespace Modules\CRM\Repositories;

use Modules\CRM\Models\CrmNote;

class NoteRepository
{
    public function __construct(protected CrmNote $model) {}

    /**
     * Notes timeline for a customer.
     */
    public function forCustomer(int $customerId, int $restaurantId)
    {
        return $this->model->query()
            ->where('customer_id', $customerId)
            ->where('restaurant_id', $restaurantId)
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find a note by id.
     */
    public function find(int $id): CrmNote
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create a note.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): CrmNote
    {
        return $this->model->create($data);
    }

    /**
     * Delete a note.
     */
    public function delete(int $id): bool
    {
        return (bool) $this->model->findOrFail($id)->delete();
    }
}
