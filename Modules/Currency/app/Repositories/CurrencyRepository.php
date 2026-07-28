<?php

namespace Modules\Currency\Repositories;

use Modules\Currency\Models\Currency;

class CurrencyRepository
{
    public function __construct(protected Currency $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Currency
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Currency
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Currency
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
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($query) use ($s) {
                $query->where('name', 'like', "%{$s}%")
                    ->orWhere('code', 'like', "%{$s}%");
            }))
            ->when($filters['is_active'] ?? null, fn($q, $a) => $q->where('is_active', $a))
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function allActive()
    {
        return $this->model->active()->orderBy('name')->get();
    }
}
