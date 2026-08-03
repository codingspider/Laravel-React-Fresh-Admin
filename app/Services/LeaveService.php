<?php

namespace App\Services;

use App\Models\HrmLeaveRequest;

class LeaveService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmLeaveRequest::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        $query->when(!empty($filters['employee_id']), function ($q) use ($filters) {
            $q->where('employee_id', $filters['employee_id']);
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('type', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('reason', 'like', '%' . $filters['search'] . '%');
            });
        });

        return $query->with(['employee', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function find(int $id): ?HrmLeaveRequest
    {
        return HrmLeaveRequest::with(['employee', 'approver'])->find($id);
    }

    public function create(array $data): HrmLeaveRequest
    {
        $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();
        $data['days'] = $this->calculateDays($data['start_date'], $data['end_date']);

        return HrmLeaveRequest::create($data);
    }

    public function update(int $id, array $data): HrmLeaveRequest
    {
        $leave = HrmLeaveRequest::findOrFail($id);

        if (isset($data['start_date']) || isset($data['end_date'])) {
            $startDate = $data['start_date'] ?? $leave->start_date;
            $endDate = $data['end_date'] ?? $leave->end_date;
            $data['days'] = $this->calculateDays($startDate, $endDate);
        }

        if (isset($data['status']) && in_array($data['status'], ['approved', 'rejected'])) {
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        }

        $leave->update($data);
        return $leave;
    }

    public function delete(int $id): void
    {
        HrmLeaveRequest::findOrFail($id)->delete();
    }

    public function approve(int $id, bool $approved, ?string $notes = null): HrmLeaveRequest
    {
        $leave = HrmLeaveRequest::findOrFail($id);
        $leave->update([
            'status' => $approved ? 'approved' : 'rejected',
                'approved_by' => auth()->id(),
            'approved_at' => now(),
            'approval_notes' => $notes,
        ]);

        return $leave;
    }

    protected function calculateDays(string $startDate, string $endDate): int
    {
        return (int) \Carbon\Carbon::parse($startDate)->diffInDays(\Carbon\Carbon::parse($endDate)) + 1;
    }
}
