<?php

namespace Modules\POS\Services;

use Modules\POS\Repositories\CouponRepository;

class CouponService
{
    protected $repository;

    public function __construct(CouponRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAll(array $filters = [], int $perPage = 15)
    {
        return $this->repository->getAll($filters, $perPage);
    }

    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    public function validate(string $code, float $orderAmount, ?int $restaurantId = null, ?int $branchId = null, ?int $customerId = null): array
    {
        return $this->repository->validate($code, $orderAmount, $restaurantId, $branchId, $customerId);
    }

    public function create(array $data)
    {
        $data['code'] = strtoupper($data['code']);
        return $this->repository->create($data);
    }

    public function update(int $id, array $data)
    {
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }
        return $this->repository->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->repository->delete($id);
    }

    public function count(array $filters = []): int
    {
        return $this->repository->count($filters);
    }
}
