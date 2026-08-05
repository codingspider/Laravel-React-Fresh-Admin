<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\JournalEntry;
use Modules\Accounting\Models\Account;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function profitAndLoss(int $restaurantId, string $dateFrom = null, string $dateTo = null): array
    {
        $entries = JournalEntry::forRestaurant($restaurantId)
            ->with('account');
        if ($dateFrom && $dateTo) {
            $entries->byDateRange($dateFrom, $dateTo);
        }

        $entries = $entries->get();

        $incomeEntries = $entries->where('entry_type', 'debit')
            ->where('source_module', 'income');
        $expenseEntries = $entries->where('entry_type', 'debit')
            ->where('source_module', 'expense');

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

    public function dashboard(int $restaurantId): array
    {
        $today = now()->format('Y-m-d');
        $monthStart = now()->startOfMonth()->format('Y-m-d');
        $monthEnd = now()->endOfMonth()->format('Y-m-d');

        $todayEntries = JournalEntry::forRestaurant($restaurantId)
            ->whereDate('entry_date', $today)
            ->get();

        $monthEntries = JournalEntry::forRestaurant($restaurantId)
            ->whereBetween('entry_date', [$monthStart, $monthEnd])
            ->get();

        $todaySales = $todayEntries->where('entry_type', 'debit')
            ->where('source_module', 'income')
            ->sum('amount');

        $todayExpenses = $todayEntries->where('entry_type', 'debit')
            ->where('source_module', 'expense')
            ->sum('amount');

        $todayProfit = $todaySales - $todayExpenses;

        $monthSales = $monthEntries->where('entry_type', 'debit')
            ->where('source_module', 'income')
            ->sum('amount');

        $monthExpenses = $monthEntries->where('entry_type', 'debit')
            ->where('source_module', 'expense')
            ->sum('amount');

        $monthProfit = $monthSales - $monthExpenses;

        $cashBankAccounts = Account::forRestaurant($restaurantId)
            ->byType('asset')
            ->whereIn('account_group', ['cash', 'bank', 'bkash', 'nagad', 'rocket'])
            ->get();

        $cashBankBalance = 0;
        foreach ($cashBankAccounts as $account) {
            $accountEntries = JournalEntry::forRestaurant($restaurantId)
                ->byAccount($account->id)
                ->get();

            $balance = $account->opening_balance ?? 0;
            foreach ($accountEntries as $entry) {
                $balance += $entry->entry_type === 'debit' ? $entry->amount : -$entry->amount;
            }
            $cashBankBalance += $balance;
        }

        $receivables = Account::forRestaurant($restaurantId)
            ->where('account_group', 'accounts_receivable')
            ->first();

        $receivablesBalance = 0;
        if ($receivables) {
            $balance = $receivables->opening_balance ?? 0;
            $accountEntries = JournalEntry::forRestaurant($restaurantId)
                ->byAccount($receivables->id)
                ->get();
            foreach ($accountEntries as $entry) {
                $balance += $entry->entry_type === 'debit' ? $entry->amount : -$entry->amount;
            }
            $receivablesBalance = $balance;
        }

        $payables = Account::forRestaurant($restaurantId)
            ->where('account_group', 'accounts_payable')
            ->first();

        $payablesBalance = 0;
        if ($payables) {
            $balance = $payables->opening_balance ?? 0;
            $accountEntries = JournalEntry::forRestaurant($restaurantId)
                ->byAccount($payables->id)
                ->get();
            foreach ($accountEntries as $entry) {
                $balance += $entry->entry_type === 'credit' ? $entry->amount : -$entry->amount;
            }
            $payablesBalance = $balance;
        }

        $salesByDay = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dailySales = JournalEntry::forRestaurant($restaurantId)
                ->where('entry_date', $date)
                ->where('entry_type', 'debit')
                ->whereHas('account', fn($q) => $q->where('type', 'income'))
                ->sum('amount');

            $dailyExpenses = JournalEntry::forRestaurant($restaurantId)
                ->where('entry_date', $date)
                ->where('entry_type', 'debit')
                ->whereHas('account', fn($q) => $q->where('type', 'expense'))
                ->sum('amount');

            $salesByDay[] = [
                'date' => $date,
                'sales' => $dailySales,
                'expenses' => $dailyExpenses,
                'profit' => $dailySales - $dailyExpenses,
            ];
        }

        return [
            'today' => [
                'sales' => $todaySales,
                'expenses' => $todayExpenses,
                'profit' => $todayProfit,
            ],
            'month' => [
                'sales' => $monthSales,
                'expenses' => $monthExpenses,
                'profit' => $monthProfit,
            ],
            'cash_bank_balance' => $cashBankBalance,
            'accounts_receivable' => $receivablesBalance,
            'accounts_payable' => $payablesBalance,
            'sales_trend' => $salesByDay,
        ];
    }
}
