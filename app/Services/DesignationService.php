<?php

namespace App\Services;

use App\Models\HrmDesignation;
use Illuminate\Support\Str;

class DesignationService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmDesignation::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['department_id']), function ($q) use ($filters) {
            $q->where('department_id', $filters['department_id']);
        });

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        });

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        return $query->with('department', 'branch')->orderBy('name')->paginate($perPage);
    }

    public function find(int $id): ?HrmDesignation
    {
        return HrmDesignation::with(['department'])->find($id);
    }

    public function create(array $data): HrmDesignation
    {
        $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return HrmDesignation::create($data);
    }

    public function update(int $id, array $data): HrmDesignation
    {
        $designation = HrmDesignation::findOrFail($id);
        $designation->update($data);

        return $designation;
    }

    public function delete(int $id): void
    {
        HrmDesignation::findOrFail($id)->delete();
    }

    public function allForRestaurant(int $restaurantId)
    {
        return HrmDesignation::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }
}
