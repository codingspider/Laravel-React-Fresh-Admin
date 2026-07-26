<?php

namespace Modules\Employee\Services;

use Modules\Employee\Repositories\EmployeeRepository;

class EmployeeService
{
    public function __construct(protected EmployeeRepository $repository) {}

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
}
