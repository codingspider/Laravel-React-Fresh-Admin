<?php

namespace App\Services;

use App\Models\HrmPayroll;

class PayrollService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = HrmPayroll::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['employee_id']), function ($q) use ($filters) {
            $q->where('employee_id', $filters['employee_id']);
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->whereHas('employee', function ($q) use ($filters) {
                $q->where('first_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('last_name', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['pay_period_start']), function ($q) use ($filters) {
            $q->where('pay_period_start', '>=', $filters['pay_period_start']);
        });

        $query->when(!empty($filters['pay_period_end']), function ($q) use ($filters) {
            $q->where('pay_period_end', '<=', $filters['pay_period_end']);
        });

        return $query->with(['employee'])
            ->orderBy('pay_period_start', 'desc')
            ->paginate($perPage);
    }

    public function find(int $id): ?HrmPayroll
    {
        return HrmPayroll::with(['employee'])->find($id);
    }

    public function create(array $data): HrmPayroll
    {
        $data['restaurant_id'] = $data['restaurant_id'] ?? getRestaurantId();
        $data['net_salary'] = $this->calculateNetSalary($data);

        return HrmPayroll::create($data);
    }

    public function update(int $id, array $data): HrmPayroll
    {
        $payroll = HrmPayroll::findOrFail($id);

        $salaryFields = ['basic_salary', 'overtime_hours', 'overtime_rate', 'bonus', 'allowance', 'deduction', 'pf', 'tax'];
        $recalculate = false;
        foreach ($salaryFields as $field) {
            if (array_key_exists($field, $data)) {
                $recalculate = true;
                break;
            }
        }

        if ($recalculate) {
            $merged = array_merge($payroll->toArray(), $data);
            $data['net_salary'] = $this->calculateNetSalary($merged);
        }

        $payroll->update($data);
        return $payroll;
    }

    public function delete(int $id): void
    {
        HrmPayroll::findOrFail($id)->delete();
    }

    public function getSummary(array $filters = []): array
    {
        $query = HrmPayroll::query();

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->when(!empty($filters['employee_id']), function ($q) use ($filters) {
            $q->where('employee_id', $filters['employee_id']);
        });

        $totalRecords = (clone $query)->count();
        $totalPaid = (clone $query)->where('status', 'paid')->sum('net_salary');
        $totalPending = (clone $query)->where('status', 'pending')->sum('net_salary');
        $totalNetSalary = (clone $query)->sum('net_salary');

        return [
            'total_records' => $totalRecords,
            'total_paid' => $totalPaid,
            'total_pending' => $totalPending,
            'total_net_salary' => $totalNetSalary,
        ];
    }

    protected function calculateNetSalary(array $data): float
    {
        $basicSalary = $data['basic_salary'] ?? 0;
        $overtimeHours = $data['overtime_hours'] ?? 0;
        $overtimeRate = $data['overtime_rate'] ?? 0;
        $bonus = $data['bonus'] ?? 0;
        $allowance = $data['allowance'] ?? 0;
        $deduction = $data['deduction'] ?? 0;
        $pf = $data['pf'] ?? 0;
        $tax = $data['tax'] ?? 0;

        return $basicSalary + ($overtimeHours * $overtimeRate) + $bonus + $allowance - $deduction - $pf - $tax;
    }
}
