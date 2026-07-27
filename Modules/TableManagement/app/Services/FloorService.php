<?php

namespace Modules\TableManagement\Services;

use Modules\TableManagement\Repositories\FloorRepository;

class FloorService
{
    public function __construct(protected FloorRepository $repository) {}

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

    public function getByBranch($branchId)
    {
        return $this->repository->getByBranch($branchId);
    }

    public function getByRestaurant($restaurantId)
    {
        return $this->repository->getByRestaurant($restaurantId);
    }
}
