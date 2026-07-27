<?php

namespace Modules\Restaurant\Services;

use Modules\Restaurant\Repositories\RestaurantRepository;

class RestaurantService
{
    public function __construct(protected RestaurantRepository $repository) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    public function findBySlug(string $slug)
    {
        return $this->repository->findBySlug($slug);
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

    public function getActive()
    {
        return $this->repository->getActive();
    }

    public function getByOwner($ownerId)
    {
        return $this->repository->getByOwner($ownerId);
    }

    public function updateSettings(int $id, string $type, array $settings)
    {
        $restaurant = $this->find($id);
        $restaurant->update([$type => $settings]);
        return $restaurant;
    }

    public function updateWorkingHours(int $id, array $hours)
    {
        return $this->updateSettings($id, 'working_hours', $hours);
    }

    public function updateTaxSettings(int $id, array $taxData)
    {
        $restaurant = $this->find($id);
        $restaurant->update([
            'tax_rate' => $taxData['tax_rate'],
            'tax_name' => $taxData['tax_name'],
            'tax_inclusive' => $taxData['tax_inclusive'] ?? false,
        ]);
        return $restaurant;
    }
}
