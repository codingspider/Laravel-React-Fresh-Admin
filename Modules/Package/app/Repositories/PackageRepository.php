<?php

namespace Modules\Package\Repositories;

use Modules\Package\Models\Package;

class PackageRepository
{
    public function __construct(protected Package $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Package
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Package
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Package
    {
        $item = $this->find($id);
        $item->update($data);
        return $item;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%");
            }))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
