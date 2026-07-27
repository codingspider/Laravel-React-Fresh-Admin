<?php

namespace Modules\TableManagement\Services;

use Modules\TableManagement\Repositories\TableRepository;

class TableService
{
    public function __construct(protected TableRepository $repository) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->repository->delete($id);
    }

    public function getAvailable($restaurantId, $branchId, $guestCount = null)
    {
        return $this->repository->getAvailable($restaurantId, $branchId, $guestCount);
    }

    public function updateStatus(int $id, string $status)
    {
        return $this->repository->updateStatus($id, $status);
    }
}
