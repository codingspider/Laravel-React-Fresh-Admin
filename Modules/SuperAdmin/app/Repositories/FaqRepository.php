<?php

namespace Modules\SuperAdmin\Repositories;

use Modules\SuperAdmin\Models\Faq;

class FaqRepository
{
    public function __construct(protected Faq $model) {}

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

    public function active()
    {
        return $this->model
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where('question', 'like', "%{$s}%"))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', $filters['is_active']))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate($perPage);
    }
}
