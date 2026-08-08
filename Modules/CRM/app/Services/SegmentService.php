<?php

namespace Modules\CRM\Services;

use Modules\CRM\Models\Segment;
use Modules\CRM\Repositories\SegmentRepository;

class SegmentService
{
    public function __construct(protected SegmentRepository $repository) {}

    /**
     * Paginated segment list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->repository->paginate($perPage, $filters);
    }

    /**
     * Find a segment.
     */
    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    /**
     * Create a segment.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Update a segment.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    /**
     * Delete a segment.
     */
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * List all segments for a restaurant.
     */
    public function allForRestaurant(int $restaurantId)
    {
        return $this->repository->allForRestaurant($restaurantId);
    }

    /**
     * Assign customers to a segment.
     *
     * @param  array<int, int>  $customerIds
     */
    public function assignCustomers(int $segmentId, array $customerIds): Segment
    {
        $segment = $this->repository->find($segmentId);
        $segment->customers()->syncWithoutDetaching($customerIds);

        return $segment->loadCount('customers');
    }
}
