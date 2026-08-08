<?php

namespace Modules\CRM\Services;

use Illuminate\Support\Facades\DB;
use Modules\CRM\Repositories\CrmCustomerRepository;

class CrmCustomerService
{
    public function __construct(protected CrmCustomerRepository $repository) {}

    /**
     * Paginated customer list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    /**
     * Find a customer with CRM relations.
     */
    public function find(int $id)
    {
        return $this->repository->findWithRelations($id);
    }

    /**
     * Create a customer and sync its segments.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data)
    {
        $segmentIds = $data['segment_ids'] ?? [];
        unset($data['segment_ids']);

        $customer = DB::transaction(function () use ($data) {
            return $this->repository->create($data);
        });

        $this->syncSegments($customer->id, $segmentIds);

        return $customer->load('segments:id,name,color');
    }

    /**
     * Update a customer and sync its segments.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data)
    {
        $segmentIds = $data['segment_ids'] ?? null;
        unset($data['segment_ids']);

        $customer = $this->repository->update($id, $data);

        if ($segmentIds !== null) {
            $this->syncSegments($id, $segmentIds);
        }

        return $customer->load('segments:id,name,color');
    }

    /**
     * Delete a customer.
     */
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * Sync the segments attached to a customer.
     *
     * @param  array<int, int>  $segmentIds
     */
    public function syncSegments(int $customerId, array $segmentIds): void
    {
        $customer = \Modules\Customer\Models\Customer::find($customerId);
        $customer?->segments()->sync($segmentIds);
    }

    /**
     * Create or match a customer from POS sale guest data and update
     * the aggregated spend/visit counters.
     *
     * @param  array{name?: string|null, phone?: string|null, email?: string|null, source?: string|null}  $guest
     */
    public function syncFromSale(int $restaurantId, ?int $customerId, array $guest, float $saleTotal): ?int
    {
        $customer = $customerId
            ? \Modules\Customer\Models\Customer::find($customerId)
            : $this->repository->findMatch($guest['phone'] ?? null, $guest['email'] ?? null, $restaurantId);

        if (!$customer && ($guest['phone'] || $guest['email'] || $guest['name'])) {
            $customer = $this->create([
                'restaurant_id' => $restaurantId,
                'name' => $guest['name'] ?: ($guest['phone'] ?: $guest['email']),
                'phone' => $guest['phone'] ?? null,
                'email' => $guest['email'] ?? null,
                'source' => $guest['source'] ?? 'pos',
                'is_active' => true,
            ]);
        }

        if (!$customer) {
            return null;
        }

        $customer->increment('total_orders');
        $customer->increment('total_spent', $saleTotal);
        $customer->forceFill(['last_visit_at' => now()])->save();

        return $customer->id;
    }
}
