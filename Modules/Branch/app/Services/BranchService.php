<?php

namespace Modules\Branch\Services;

use Modules\Branch\Repositories\BranchRepository;

class BranchService
{
    public function __construct(protected BranchRepository $repository) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    public function query()
    {
        return $this->repository->query();
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

    public function getActiveByRestaurant($restaurantId)
    {
        return $this->repository->getActiveByRestaurant($restaurantId);
    }

    public function getMainByRestaurant($restaurantId)
    {
        return $this->repository->getMainByRestaurant($restaurantId);
    }
}
