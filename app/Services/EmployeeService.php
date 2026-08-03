<?php

namespace App\Services;

use App\Models\HrmEmployee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmEmployee::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        $query->when(!empty($filters['department_id']), function ($q) use ($filters) {
            $q->where('department_id', $filters['department_id']);
        });

        $query->when(!empty($filters['designation_id']), function ($q) use ($filters) {
            $q->where('designation_id', $filters['designation_id']);
        });

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('employee_id', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('first_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('last_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('phone', 'like', '%' . $filters['search'] . '%');
            });
        });

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->with(['department', 'designation', 'branch'])
            ->orderBy('first_name', 'desc')
            ->paginate($perPage);
    }

    public function find(int $id): ?HrmEmployee
    {
        return HrmEmployee::with(['department', 'designation', 'branch', 'user'])->find($id);
    }

    public function create(array $data): HrmEmployee
    {
        return DB::transaction(function () use ($data) {
            $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();

            if (empty($data['employee_id'])) {
                $data['employee_id'] = $this->generateEmployeeId($data['restaurant_id']);
            }

            $employee = HrmEmployee::create($data);
            return $employee;
        });
    }

    public function update(int $id, array $data): HrmEmployee
    {
        $employee = HrmEmployee::findOrFail($id);
        $employee->update($data);

        return $employee;
    }

    public function delete(int $id): void
    {
        HrmEmployee::findOrFail($id)->delete();
    }

    public function generateEmployeeId(int $restaurantId): string
    {
        $prefix = 'EMP-';
        $year = date('Y');
        $count = HrmEmployee::where('restaurant_id', $restaurantId)
            ->whereYear('created_at', $year)
            ->count() + 1;

        return $prefix . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function getDetails(int $id): ?HrmEmployee
    {
        return HrmEmployee::with([
            'department',
            'designation',
            'branch',
            'user.roles',
            'attendances' => function ($q) {
                $q->latest('date')->limit(10);
            },
            'leaveRequests' => function ($q) {
                $q->latest('created_at')->limit(10);
            },
        ])->find($id);
    }
}
