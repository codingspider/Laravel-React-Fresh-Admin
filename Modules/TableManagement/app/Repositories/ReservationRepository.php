<?php

namespace Modules\TableManagement\Repositories;

use Modules\TableManagement\Models\Reservation;

class ReservationRepository
{
    public function __construct(protected Reservation $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Reservation
    {
        return $this->model->with(['table', 'customer'])->findOrFail($id);
    }

    public function create(array $data): Reservation
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Reservation
    {
        $reservation = $this->find($id);
        $reservation->update($data);
        return $reservation;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->with(['table', 'customer'])
            ->when($filters['restaurant_id'] ?? null, fn($q, $r) => $q->where('restaurant_id', $r))
            ->when($filters['branch_id'] ?? null, fn($q, $b) => $q->where('branch_id', $b))
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->when($filters['date'] ?? null, fn($q, $d) => $q->where('reservation_date', $d))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('guest_name', 'like', "%{$s}%")
                    ->orWhere('guest_phone', 'like', "%{$s}%")
                    ->orWhere('guest_email', 'like', "%{$s}%");
            }))
            ->orderByDesc('reservation_date')
            ->orderBy('reservation_time')
            ->paginate($perPage);
    }

    public function getForDate($restaurantId, $branchId, $date)
    {
        return $this->model->with(['table', 'customer'])
            ->where('restaurant_id', $restaurantId)
            ->where('branch_id', $branchId)
            ->where('reservation_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('reservation_time')
            ->get();
    }
}
