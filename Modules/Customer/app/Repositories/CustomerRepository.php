<?php

namespace Modules\Customer\Repositories;

use Modules\Customer\Models\Customer;

class CustomerRepository
{
    public function __construct(protected Customer $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $item = $this->find($id);
        $item->update($data);
        return $item;
    }

    public function delete($id)
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->with('branch')
            ->when($filters['restaurant_id'] ?? null, fn($q, $rid) => $q->where('restaurant_id', $rid))
            ->when($filters['branch_id'] ?? null, fn($q, $bid) => $q->where('branch_id', $bid))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('company', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            }))
            ->when(isset($filters['is_active']), fn($q) => $q->where('is_active', (bool) $filters['is_active']))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
