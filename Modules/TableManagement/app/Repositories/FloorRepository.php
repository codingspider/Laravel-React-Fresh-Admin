<?php

namespace Modules\TableManagement\Repositories;

use Modules\TableManagement\Models\Floor;

class FloorRepository
{
    public function __construct(protected Floor $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Floor
    {
        return $this->model->with('tables')->findOrFail($id);
    }

    public function create(array $data): Floor
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Floor
    {
        $floor = $this->find($id);
        $floor->update($data);
        return $floor;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function getByBranch($branchId)
    {
        return $this->model->withCount('tables')
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();
    }

    public function getByRestaurant($restaurantId)
    {
        return $this->model->withCount('tables')
            ->where('restaurant_id', $restaurantId)
            ->orderBy('sort_order')
            ->get();
    }
}
