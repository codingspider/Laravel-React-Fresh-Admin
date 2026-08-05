<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\JournalEntry;
use Modules\Accounting\Models\Account;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function profitAndLoss(int $restaurantId, string $dateFrom = null, string $dateTo = null): array
    {
        $entries = JournalEntry::forRestaurant($restaurantId);
        if ($dateFrom && $dateTo) {
            $entries->byDateRange($dateFrom, $dateTo);
        }

        $entries = $entries->get();

        $incomeEntries = $entries->where('entry_type', 'debit')
            ->filter(fn($e) => $e->account && $e->account->type === 'income');
        $expenseEntries = $entries->where('entry_type', 'debit')
            ->filter(fn($e) => $e->account && $e->account->type === 'expense');

        $totalIncome = $incomeEntries->sum('amount');
        $totalExpenses = $expenseEntries->sum('amount');
        $netProfit = $totalIncome - $totalExpenses;

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'income_breakdown' => $this->groupByType($incomeEntries, 'account_id'),
            'expense_breakdown' => $this->groupByType($expenseEntries, 'account_id'),
        ];
    }

    public function balanceSheet(int $restaurantId, string $dateTo = null): array
    {
        $entries = JournalEntry::forRestaurant($restaurantId);
        if ($dateTo) {
            $entries->where('entry_date', '<=', $dateTo);
        }

        $assetAccounts = Account::forRestaurant($restaurantId)->byType('asset')->get();
        $liabilityAccounts = Account::forRestaurant($restaurantId)->byType('liability')->get();
        $equityAccounts = Account::forRestaurant($restaurantId)->byType('equity')->get();

        $assets = [];
        $totalAssets = 0;

        foreach ($assetAccounts as $account) {
            $balance = $this->calculateAccountBalance($account, $entries, $dateTo);
            $assets[] = [
                'account' => $account,
                'balance' => $balance,
            ];
            $totalAssets += $balance;
        }

        $liabilities = [];
        $totalLiabilities = 0;

        foreach ($liabilityAccounts as $account) {
            $balance = $this->calculateAccountBalance($account, $entries, $dateTo);
            $liabilities[] = [
                'account' => $account,
                'balance' => $balance,
            ];
            $totalLiabilities += $balance;
        }

        $equities = [];
        $totalEquity = 0;

        foreach ($equityAccounts as $account) {
            $balance = $this->calculateAccountBalance($account, $entries, $dateTo);
            $equities[] = [
                'account' => $account,
                'balance' => $balance,
            ];
            $totalEquity += $balance;
        }

        return [
            'period_end' => $dateTo,
            'assets' => $assets,
            'total_assets' => $totalAssets,
            'liabilities' => $liabilities,
            'total_liabilities' => $totalLiabilities,
            'equity' => $equities,
            'total_equity' => $totalEquity,
            'total_liabilities_and_equity' => $totalLiabilities + $totalEquity,
        ];
    }

    public function cashFlow(int $restaurantId, string $dateFrom = null, string $dateTo = null): array
    {
        $entries = JournalEntry::forRestaurant($restaurantId);
        if ($dateFrom && $dateTo) {
            $entries->byDateRange($dateFrom, $dateTo);
        }

        $entries = $entries->get();

        $incomeTotal = $entries->where('source_module', 'income')->where('entry_type', 'debit')->sum('amount');
        $expenseTotal = $entries->where('source_module', 'expense')->where('entry_type', 'debit')->sum('amount');
        $depositTotal = $entries->where('source_module', 'cash_bank')->where('entry_type', 'debit')->sum('amount');
        $withdrawalTotal = $entries->where('source_module', 'cash_bank')->where('entry_type', 'credit')->sum('amount');

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'operating_activities' => [
                'income' => $incomeTotal,
                'expenses' => $expenseTotal,
            ],
            'investing_activities' => [
                'deposits' => $depositTotal,
                'withdrawals' => $withdrawalTotal,
            ],
            'net_cash_flow' => ($incomeTotal - $expenseTotal) + ($withdrawalTotal - $depositTotal),
        ];
    }

    protected function calculateAccountBalance(Account $account, $entriesQuery, ?string $dateTo): float
    {
        $balance = $account->opening_balance ?? 0;
        $accountEntries = (clone $entriesQuery)
            ->byAccount($account->id)
            ->get();

        foreach ($accountEntries as $entry) {
            if ($account->type === 'asset' || $account->type === 'expense') {
                $balance += $entry->entry_type === 'debit' ? $entry->amount : -$entry->amount;
            } else {
                $balance += $entry->entry_type === 'credit' ? $entry->amount : -$entry->amount;
            }
        }

        return $balance;
    }

    protected function groupByType($entries, $groupKey): array
    {
        $grouped = [];
        foreach ($entries as $entry) {
            $key = $entry->{$groupKey};
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'total' => 0,
                    'entries' => [],
                ];
            }
            $grouped[$key]['total'] += $entry->amount;
            $grouped[$key]['entries'][] = $entry;
        }

        return array_map(function ($item) {
            $item['account'] = $item['entries'][0]->account ?? null;
            unset($item['entries']);
            return $item;
        }, $grouped);
    }
}
