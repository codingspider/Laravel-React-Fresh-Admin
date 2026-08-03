<?php

namespace App\Services;

use App\Models\HrmHoliday;

class HolidayService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmHoliday::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        $query->when(!empty($filters['year']), function ($q) use ($filters) {
            $q->whereYear('date', $filters['year']);
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%');
            });
        });

        return $query->orderBy('date', 'asc')->paginate($perPage);
    }

    public function find(int $id): ?HrmHoliday
    {
        return HrmHoliday::find($id);
    }

    public function create(array $data): HrmHoliday
    {
        $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();

        return HrmHoliday::create($data);
    }

    public function update(int $id, array $data): HrmHoliday
    {
        $holiday = HrmHoliday::findOrFail($id);
        $holiday->update($data);

        return $holiday;
    }

    public function delete(int $id): void
    {
        HrmHoliday::findOrFail($id)->delete();
    }

    public function upsertRecurring(int $year): void
    {
        $fixedHolidays = HrmHoliday::where('type', 'recurring')
            ->where('status', 'active')
            ->get();

        foreach ($fixedHolidays as $holiday) {
            $existingDate = $holiday->date;
            $newDate = $existingDate->copy()->year($year);

            $exists = HrmHoliday::where('restaurant_id', $holiday->restaurant_id)
                ->where('name', $holiday->name)
                ->whereYear('date', $year)
                ->exists();

            if (!$exists) {
                HrmHoliday::create([
                    'restaurant_id' => $holiday->restaurant_id,
                    'branch_id' => $holiday->branch_id,
                    'name' => $holiday->name,
                    'date' => $newDate,
                    'type' => 'one_time',
                    'status' => 'active',
                    'is_optional' => $holiday->is_optional,
                ]);
            }
        }
    }
}
