<?php

namespace Modules\Payroll\Repositories;

use Modules\Payroll\Models\Payroll;

class PayrollRepository
{
    public function __construct(protected Payroll $model) {}

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
        return $this->model->with(['branch', 'employee'])
            ->when($filters['branch_id'] ?? null, fn($q, $b) => $q->where('branch_id', $b))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->whereHas('employee', fn($q) => $q->where('name', 'like', "%{$s}%"));
            }))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
