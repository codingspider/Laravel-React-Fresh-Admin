<?php

namespace Modules\CRM\Repositories;

use Modules\Customer\Models\Customer;

class CrmCustomerRepository
{
    public function __construct(protected Customer $model) {}

    /**
     * Paginated customer list with CRM filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['restaurant_id'] ?? null, fn ($q, $restaurantId) => $q->where('restaurant_id', $restaurantId))
            ->when($filters['branch_id'] ?? null, fn ($q, $b) => $q->where('branch_id', $b))
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            }))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', (bool) $filters['is_active']))
            ->when($filters['lead_status'] ?? null, fn ($q, $status) => $q->where('lead_status', $status))
            ->when($filters['source'] ?? null, fn ($q, $source) => $q->where('source', $source))
            ->when($filters['min_spend'] ?? null, fn ($q, $minSpend) => $q->where('total_spent', '>=', (float) $minSpend))
            ->when($filters['birthday_month'] ?? null, fn ($q, $month) => $q->whereMonth('dob', (int) $month))
            ->when($filters['segment_id'] ?? null, fn ($q, $segmentId) => $q->whereHas('segments', fn ($q) => $q->where('crm_segments.id', $segmentId)))
            ->with(['segments:id,name,color', 'branch:id,name'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Find a customer by id with CRM relations loaded.
     */
    public function findWithRelations(int $id): Customer
    {
        return $this->model->query()
            ->with(['segments:id,name,color', 'followUps', 'crmNotes.creator:id,name'])
            ->findOrFail($id);
    }

    /**
     * Find a customer by phone, falling back to email.
     */
    public function findMatch(?string $phone, ?string $email, int $restaurantId): ?Customer
    {
        return $this->model->query()
            ->where('restaurant_id', $restaurantId)
            ->where(function ($q) use ($phone, $email) {
                if ($phone) {
                    $q->orWhere('phone', $phone);
                }
                if ($email) {
                    $q->orWhere('email', $email);
                }
            })
            ->orderBy('id')
            ->first();
    }

    /**
     * Create a new customer.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Customer
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing customer.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Customer
    {
        $item = $this->model->findOrFail($id);
        $item->update($data);

        return $item->load('segments:id,name,color');
    }

    /**
     * Delete a customer.
     */
    public function delete(int $id): bool
    {
        return (bool) $this->model->findOrFail($id)->delete();
    }

    /**
     * Get the model class bound to this repository.
     */
    public function model(): string
    {
        return Customer::class;
    }
}
