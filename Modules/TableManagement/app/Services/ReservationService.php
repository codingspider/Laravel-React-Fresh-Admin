<?php

namespace Modules\TableManagement\Services;

use Modules\TableManagement\Repositories\ReservationRepository;
use Modules\TableManagement\Repositories\TableRepository;

class ReservationService
{
    public function __construct(
        protected ReservationRepository $reservationRepository,
        protected TableRepository $tableRepository,
    ) {}

    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->reservationRepository->paginate($perPage, $filters);
    }

    public function find(int $id)
    {
        return $this->reservationRepository->find($id);
    }

    public function create(array $data)
    {
        $reservation = $this->reservationRepository->create($data);
        if (!empty($data['table_id'])) {
            $this->tableRepository->updateStatus($data['table_id'], 'reserved');
        }
        return $reservation;
    }

    public function update(int $id, array $data)
    {
        return $this->reservationRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        $reservation = $this->find($id);
        if ($reservation->table_id) {
            $this->tableRepository->updateStatus($reservation->table_id, 'available');
        }
        return $this->reservationRepository->delete($id);
    }

    public function confirm(int $id)
    {
        return $this->reservationRepository->update($id, ['status' => 'confirmed']);
    }

    public function cancel(int $id)
    {
        $reservation = $this->find($id);
        if ($reservation->table_id) {
            $this->tableRepository->updateStatus($reservation->table_id, 'available');
        }
        return $this->reservationRepository->update($id, ['status' => 'cancelled']);
    }

    public function seat(int $id)
    {
        $reservation = $this->find($id);
        if ($reservation->table_id) {
            $this->tableRepository->updateStatus($reservation->table_id, 'occupied');
        }
        return $this->reservationRepository->update($id, ['status' => 'seated']);
    }

    public function complete(int $id)
    {
        $reservation = $this->find($id);
        if ($reservation->table_id) {
            $this->tableRepository->updateStatus($reservation->table_id, 'available');
        }
        return $this->reservationRepository->update($id, ['status' => 'completed']);
    }

    public function noShow(int $id)
    {
        return $this->reservationRepository->update($id, ['status' => 'no_show']);
    }

    public function getForDate($restaurantId, $branchId, $date)
    {
        return $this->reservationRepository->getForDate($restaurantId, $branchId, $date);
    }
}
