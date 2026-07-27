<?php

namespace Modules\POS\Repositories;

use Modules\POS\Models\PosSession;

class PosSessionRepository
{
    public function __construct(protected PosSession $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): PosSession
    {
        return $this->model->with(['user', 'branch'])->findOrFail($id);
    }

    public function create(array $data): PosSession
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): PosSession
    {
        $session = $this->find($id);
        $session->update($data);
        return $session;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function getOpenSession($branchId, $userId): ?PosSession
    {
        return $this->model->where('branch_id', $branchId)
            ->where('user_id', $userId)
            ->where('status', 'open')
            ->first();
    }

    public function paginate($perPage, array $filters = [])
    {
        $query = $this->model->with(['user', 'branch']);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('user', fn($q) => $q->where('name', 'like', "%{$filters['search']}%"));
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        return $query->latest()->paginate($perPage);
    }
}
