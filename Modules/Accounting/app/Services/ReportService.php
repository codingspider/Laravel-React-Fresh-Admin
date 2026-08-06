<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\JournalEntry;
use Modules\Accounting\Models\Account;
use Modules\Accounting\Models\Income;
use Modules\Accounting\Models\Expense;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function profitAndLoss(int $restaurantId, ?string $dateFrom = null, ?string $dateTo = null, ?int $branchId = null): array
    {
        $incomeQuery = Income::forRestaurant($restaurantId)->with('account');
        $expenseQuery = Expense::forRestaurant($restaurantId)->with(['account', 'category']);

        if ($branchId) {
            $incomeQuery->where('branch_id', $branchId);
            $expenseQuery->where('branch_id', $branchId);
        }

        if ($dateFrom && $dateTo) {
            $incomeQuery->whereBetween('income_date', [$dateFrom, $dateTo]);
            $expenseQuery->whereBetween('expense_date', [$dateFrom, $dateTo]);
        }

        $incomes = $incomeQuery->orderByDesc('income_date')->get();
        $expenses = $expenseQuery->where('status', '!=', 'rejected')->orderByDesc('expense_date')->get();

        // Revenue grouped by income account
        $revenueItems = [];
        foreach ($incomes as $income) {
            $account = $this->resolveIncomeAccount($income, $restaurantId);
            $key = $account ? 'acc-' . $account->id : 'acc-unmapped';

            if (!isset($revenueItems[$key])) {
                $revenueItems[$key] = [
                    'account_id' => $account?->id,
                    'code' => $account?->code,
                    'name' => $account?->name ?? 'Uncategorized',
                    'account_group' => $account?->account_group,
                    'amount' => 0,
                    'transactions_count' => 0,
                ];
            }
            $revenueItems[$key]['amount'] += (float) $income->amount;
            $revenueItems[$key]['transactions_count']++;
        }

        // Expenses split into COGS and operating expenses, plus a category breakdown
        $cogsItems = [];
        $operatingItems = [];
        $categoryItems = [];
        foreach ($expenses as $expense) {
            $account = $this->resolveExpenseAccount($expense, $restaurantId);
            $isCogs = $account !== null && $account->account_group === 'purchase';
            if ($isCogs) {
                $bucket = &$cogsItems;
            } else {
                $bucket = &$operatingItems;
            }
            $key = $account ? 'acc-' . $account->id : 'acc-unmapped';

            if (!isset($bucket[$key])) {
                $bucket[$key] = [
                    'account_id' => $account?->id,
                    'code' => $account?->code,
                    'name' => $account?->name ?? ($expense->category->name ?? 'Uncategorized'),
                    'account_group' => $account?->account_group,
                    'amount' => 0,
                    'transactions_count' => 0,
                ];
            }
            $bucket[$key]['amount'] += (float) $expense->amount;
            $bucket[$key]['transactions_count']++;

            $categoryKey = $expense->category ? 'cat-' . $expense->category->id : 'cat-unmapped';
            if (!isset($categoryItems[$categoryKey])) {
                $categoryItems[$categoryKey] = [
                    'category_id' => $expense->category?->id,
                    'category' => $expense->category?->name ?? 'Uncategorized',
                    'amount' => 0,
                    'transactions_count' => 0,
                ];
            }
            $categoryItems[$categoryKey]['amount'] += (float) $expense->amount;
            $categoryItems[$categoryKey]['transactions_count']++;
        }
        unset($bucket);

        $revenueItems = $this->sortByName($revenueItems);
        $cogsItems = $this->sortByName($cogsItems);
        $operatingItems = $this->sortByName($operatingItems);
        $categoryItems = $this->sortByName($categoryItems);

        $totalRevenue = round(array_sum(array_column($revenueItems, 'amount')), 2);
        $totalCogs = round(array_sum(array_column($cogsItems, 'amount')), 2);
        $totalOperating = round(array_sum(array_column($operatingItems, 'amount')), 2);
        $grossProfit = round($totalRevenue - $totalCogs, 2);
        $netProfit = round($grossProfit - $totalOperating, 2);
        $netMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0;

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'branch_id' => $branchId,
            // Summary
            'total_income' => $totalRevenue,
            'total_revenue' => $totalRevenue,
            'total_cogs' => $totalCogs,
            'gross_profit' => $grossProfit,
            'total_expenses' => round($totalCogs + $totalOperating, 2),
            'total_operating_expenses' => $totalOperating,
            'net_profit' => $netProfit,
            'net_margin' => $netMargin,
            // Statement sections
            'revenue' => [
                'items' => array_values($revenueItems),
                'total' => $totalRevenue,
            ],
            'cogs' => [
                'items' => array_values($cogsItems),
                'total' => $totalCogs,
            ],
            'operating_expenses' => [
                'items' => array_values($operatingItems),
                'total' => $totalOperating,
            ],
            'expense_by_category' => [
                'items' => array_values($categoryItems),
                'total' => round($totalCogs + $totalOperating, 2),
            ],
            // Transaction details
            'income_transactions' => $incomes->map(fn(Income $income) => [
                'id' => $income->id,
                'date' => optional($income->income_date)->format('Y-m-d'),
                'source' => $income->source,
                'account' => $this->resolveIncomeAccount($income, $restaurantId)?->name ?? 'Uncategorized',
                'category' => $income->category,
                'reference_number' => $income->reference_number,
                'payment_method' => $income->payment_method,
                'amount' => (float) $income->amount,
                'notes' => $income->notes,
            ])->values()->all(),
            'expense_transactions' => $expenses->map(fn(Expense $expense) => [
                'id' => $expense->id,
                'date' => optional($expense->expense_date)->format('Y-m-d'),
                'status' => $expense->status,
                'account' => $this->resolveExpenseAccount($expense, $restaurantId)?->name ?? ($expense->category->name ?? 'Uncategorized'),
                'category' => $expense->category?->name,
                'reference_number' => $expense->reference_number,
                'payment_method' => $expense->payment_method,
                'amount' => (float) $expense->amount,
                'notes' => $expense->notes,
            ])->values()->all(),
        ];
    }

    /**
     * Resolve the income account used for statement grouping.
     * Falls back to the system account mapped from the income source.
     */
    protected function resolveIncomeAccount(Income $income, int $restaurantId): ?Account
    {
        if ($income->account && $income->account->type === 'income') {
            return $income->account;
        }

        $group = $income->source === 'pos_sale' ? 'food_sales' : 'other_income';

        return Account::forRestaurant($restaurantId)
            ->byType('income')
            ->where('account_group', $group)
            ->first();
    }

    /**
     * Resolve the expense account used for statement grouping.
     * Returns null when the expense is not linked to a real expense account.
     */
    protected function resolveExpenseAccount(Expense $expense, int $restaurantId): ?Account
    {
        if ($expense->account && $expense->account->type === 'expense') {
            return $expense->account;
        }

        return null;
    }

    protected function sortByName(array $items): array
    {
        usort($items, fn($a, $b) => strcmp((string) $a['name'], (string) $b['name']));

        return $items;
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
