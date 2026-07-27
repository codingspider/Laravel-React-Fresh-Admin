<?php

namespace Modules\POS\Repositories;

use Modules\POS\Models\Payment;

class PaymentRepository
{
    public function __construct(protected Payment $model) {}

    public function query()
    {
        return $this->model->query();
    }

    public function find($id): Payment
    {
        return $this->model->with(['sale', 'user'])->findOrFail($id);
    }

    public function create(array $data): Payment
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Payment
    {
        $payment = $this->find($id);
        $payment->update($data);
        return $payment;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function getBySale($saleId)
    {
        return $this->model->where('sale_id', $saleId)->get();
    }
}
