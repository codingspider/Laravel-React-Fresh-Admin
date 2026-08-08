<?php

namespace Modules\CRM\Repositories;

use Modules\CRM\Models\Segment;

class SegmentRepository
{
    public function __construct(protected Segment $model) {}

    /**
     * Paginated segment list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = [])
    {
        return $this->model->query()
            ->when($filters['restaurant_id'] ?? null, fn ($q, $restaurantId) => $q->where('restaurant_id', $restaurantId))
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->withCount('customers')
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Find a segment by id.
     */
    public function find(int $id): Segment
    {
        return $this->model->withCount('customers')->findOrFail($id);
    }

    /**
     * Create a segment.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Segment
    {
        return $this->model->create($data);
    }

    /**
     * Update a segment.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Segment
    {
        $item = $this->find($id);
        $item->update($data);

        return $item->loadCount('customers');
    }

    /**
     * Delete a segment.
     */
    public function delete(int $id): bool
    {
        return (bool) $this->model->findOrFail($id)->delete();
    }

    /**
     * List all segments for a restaurant (used for dropdowns).
     */
    public function allForRestaurant(int $restaurantId)
    {
        return $this->model->query()
            ->where('restaurant_id', $restaurantId)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);
    }
}
