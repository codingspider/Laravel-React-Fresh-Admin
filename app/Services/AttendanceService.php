<?php

namespace App\Services;

use App\Models\HrmAttendance;

class AttendanceService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmAttendance::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        $query->when(!empty($filters['employee_id']), function ($q) use ($filters) {
            $q->where('employee_id', $filters['employee_id']);
        });

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->whereDate('date', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->whereDate('date', '<=', $filters['date_to']);
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        return $query->with(['employee', 'branch'])
            ->orderBy('date', 'desc')
            ->paginate($perPage);
    }

    public function find(int $id): ?HrmAttendance
    {
        return HrmAttendance::with(['employee'])->find($id);
    }

    public function create(array $data): HrmAttendance
    {
        $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();

        return HrmAttendance::create($data);
    }

    public function update(int $id, array $data): HrmAttendance
    {
        $attendance = HrmAttendance::findOrFail($id);
        $attendance->update($data);

        return $attendance;
    }

    public function delete(int $id): void
    {
        HrmAttendance::findOrFail($id)->delete();
    }

    public function markAttendance(int $employeeId, array $data): HrmAttendance
    {
        $data['employee_id'] = $employeeId;

        $attendance = HrmAttendance::updateOrCreate(
            ['employee_id' => $employeeId, 'date' => $data['date'] ?? today()],
            $data
        );

        return $attendance;
    }

    public function getForEmployee(int $employeeId, ?string $dateFrom = null, ?string $dateTo = null)
    {
        $query = HrmAttendance::where('employee_id', $employeeId);
        $query->when($dateFrom, fn($q) => $q->whereDate('date', '>=', $dateFrom));
        $query->when($dateTo, fn($q) => $q->whereDate('date', '<=', $dateTo));

        return $query->orderBy('date', 'desc')->get();
    }
}
