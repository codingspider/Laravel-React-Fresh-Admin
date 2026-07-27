<?php

namespace Modules\POS\Repositories;

use Modules\POS\Models\Sale;

class SaleRepository
{
    public function __construct(protected Sale $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Sale
    {
        return $this->model->with(['items.menuItem', 'payments', 'table', 'customer', 'user'])->findOrFail($id);
    }

    public function create(array $data): Sale
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Sale
    {
        $sale = $this->find($id);
        $sale->update($data);
        return $sale;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function paginate($perPage, array $filters = [])
    {
        $query = $this->model->with(['items', 'payments', 'table', 'customer', 'user']);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('invoice_number', 'like', "%{$filters['search']}%")
                    ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$filters['search']}%"));
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['order_type'])) {
            $query->where('order_type', $filters['order_type']);
        }

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->latest()->paginate($perPage);
    }
}
