<?php

namespace Modules\CRM\Services;

use Modules\CRM\Repositories\FollowUpRepository;

class FollowUpService
{
    public function __construct(protected FollowUpRepository $repository) {}

    /**
     * Paginated follow-up list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    /**
     * Find a follow-up.
     */
    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    /**
     * Create a follow-up.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Update a follow-up.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    /**
     * Mark a follow-up as completed.
     */
    public function complete(int $id)
    {
        return $this->repository->complete($id);
    }

    /**
     * Delete a follow-up.
     */
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
