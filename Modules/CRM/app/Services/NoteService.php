<?php

namespace Modules\CRM\Services;

use Modules\CRM\Repositories\NoteRepository;

class NoteService
{
    public function __construct(protected NoteRepository $repository) {}

    /**
     * Notes timeline for a customer.
     */
    public function forCustomer(int $customerId, int $restaurantId)
    {
        return $this->repository->forCustomer($customerId, $restaurantId);
    }

    /**
     * Find a note.
     */
    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    /**
     * Create a note.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Delete a note.
     */
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
