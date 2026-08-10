<?php

namespace App\Services;

use App\Models\HrmDepartment;
use Illuminate\Support\Str;

class DepartmentService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmDepartment::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        });

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->with('branch')->orderBy('name')->paginate($perPage);
    }

    public function find(int $id): ?HrmDepartment
    {
        return HrmDepartment::with(['designations', 'head'])->find($id);
    }

    public function create(array $data): HrmDepartment
    {
        $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return HrmDepartment::create($data);
    }

    public function update(int $id, array $data): HrmDepartment
    {
        $department = HrmDepartment::findOrFail($id);
        $department->update($data);

        return $department;
    }

    public function delete(int $id): void
    {
        HrmDepartment::findOrFail($id)->delete();
    }

    public function allForRestaurant(int $restaurantId)
    {
        return HrmDepartment::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }
}
