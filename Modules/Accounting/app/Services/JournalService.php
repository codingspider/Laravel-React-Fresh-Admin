<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\JournalEntry;
use Modules\Accounting\Models\Account;
use Modules\Accounting\Models\Income;
use Modules\Accounting\Models\Expense;
use Modules\Accounting\Models\CashBankTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JournalService
{
    public function paginate(int $perPage = 15, array $filters = []): mixed
    {
        $query = JournalEntry::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('voucher_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('reference_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['account_id']), function ($q) use ($filters) {
            $q->byAccount($filters['account_id']);
        });

        $query->when(!empty($filters['entry_type']), function ($q) use ($filters) {
            $q->byType($filters['entry_type']);
        });

        $query->when(!empty($filters['date_from']) && !empty($filters['date_to']), function ($q) use ($filters) {
            $q->byDateRange($filters['date_from'], $filters['date_to']);
        });

        return $query->with('account')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function find(int $id): ?JournalEntry
    {
        return JournalEntry::with(['account', 'related'])->find($id);
    }

    public function allForAccount(int $restaurantId, int $accountId): array
    {
        return JournalEntry::forRestaurant($restaurantId)
            ->byAccount($accountId)
            ->with('account')
            ->orderBy('entry_date')
            ->get()
            ->toArray();
    }

    public function generalLedger(int $restaurantId, array $filters = []): array
    {
        $query = JournalEntry::forRestaurant($restaurantId);

        if (!empty($filters['account_id'])) {
            $query->byAccount($filters['account_id']);
        }

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->byDateRange($filters['date_from'], $filters['date_to']);
        }

        $entries = $query->with('account')->orderBy('entry_date')->get();

        $grouped = [];
        foreach ($entries as $entry) {
            $key = $entry->account_id;
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'account' => $entry->account,
                    'entries' => [],
                    'opening_balance' => $entry->account->opening_balance ?? 0,
                    'total_debit' => 0,
                    'total_credit' => 0,
                ];
            }
            $grouped[$key]['entries'][] = $entry;
            if ($entry->entry_type === 'debit') {
                $grouped[$key]['total_debit'] += $entry->amount;
            } else {
                $grouped[$key]['total_credit'] += $entry->amount;
            }
        }

        foreach ($grouped as $key => $data) {
            $grouped[$key]['closing_balance'] = $data['opening_balance'] + $data['total_debit'] - $data['total_credit'];
        }

        return $grouped;
    }

    public function trialBalance(int $restaurantId, array $filters = []): array
    {
        $query = JournalEntry::forRestaurant($restaurantId);

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->byDateRange($filters['date_from'], $filters['date_to']);
        }

        $entries = $query->with('account')->get();

        $balances = [];
        foreach ($entries as $entry) {
            $key = $entry->account_id;
            if (!isset($balances[$key])) {
                $balances[$key] = [
                    'account' => $entry->account,
                    'debit' => 0,
                    'credit' => 0,
                ];
            }

            if ($entry->entry_type === 'debit') {
                $balances[$key]['debit'] += $entry->amount;
            } else {
                $balances[$key]['credit'] += $entry->amount;
            }
        }

        $result = [];
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($balances as $accountId => $data) {
            $net = $data['debit'] - $data['credit'];
            $result[] = [
                'account_id' => $accountId,
                'account_code' => $data['account']->code,
                'account_name' => $data['account']->name,
                'account_type' => $data['account']->type,
                'debit' => $data['debit'],
                'credit' => $data['credit'],
                'balance' => abs($net),
                'balance_type' => $net >= 0 ? 'debit' : 'credit',
            ];
            $totalDebit += $data['debit'];
            $totalCredit += $data['credit'];
        }

        $result = array_map(null, $result);

        return [
            'balances' => $result,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'balanced' => abs($totalDebit - $totalCredit) < 0.01,
        ];
    }

    public function createJournalForIncome(Income $income): void
    {
        $voucher = $this->generateVoucher($income->restaurant_id, 'income');

        DB::transaction(function () use ($income, $voucher) {
            if ($income->account_id) {
                JournalEntry::create([
                    'restaurant_id' => $income->restaurant_id,
                    'account_id' => $income->account_id,
                    'related_id' => $income->id,
                    'related_type' => Income::class,
                    'reference_number' => $income->reference_number,
                    'voucher_number' => $voucher,
                    'entry_type' => 'debit',
                    'amount' => $income->amount,
                    'entry_date' => $income->income_date,
                    'description' => 'Income: ' . $income->source,
                    'source_module' => 'income',
                ]);
            }

            $cashAccountId = $this->getOffsetAccountId($income->restaurant_id, $income->payment_method);
            if ($cashAccountId) {
                JournalEntry::create([
                    'restaurant_id' => $income->restaurant_id,
                    'account_id' => $cashAccountId,
                    'related_id' => $income->id,
                    'related_type' => Income::class,
                    'reference_number' => $income->reference_number,
                    'voucher_number' => $voucher,
                    'entry_type' => 'credit',
                    'amount' => $income->amount,
                    'entry_date' => $income->income_date,
                    'description' => 'Payment received via ' . ($income->payment_method ?? 'cash'),
                    'source_module' => 'income',
                ]);
            }
        });
    }

    public function createJournalForExpense(Expense $expense): void
    {
        $voucher = $this->generateVoucher($expense->restaurant_id, 'expense');

        DB::transaction(function () use ($expense, $voucher) {
            $expenseAccountId = $expense->account_id ?? $this->getDefaultExpenseAccount($expense->restaurant_id);

            if ($expenseAccountId) {
                JournalEntry::create([
                    'restaurant_id' => $expense->restaurant_id,
                    'account_id' => $expenseAccountId,
                    'related_id' => $expense->id,
                    'related_type' => Expense::class,
                    'reference_number' => $expense->reference_number,
                    'voucher_number' => $voucher,
                    'entry_type' => 'debit',
                    'amount' => $expense->amount,
                    'entry_date' => $expense->expense_date,
                    'description' => 'Expense: ' . ($expense->category->name ?? 'Expense'),
                    'source_module' => 'expense',
                ]);
            }

            $paymentAccountId = $this->getOffsetAccountId($expense->restaurant_id, $expense->payment_method);
            if ($paymentAccountId) {
                JournalEntry::create([
                    'restaurant_id' => $expense->restaurant_id,
                    'account_id' => $paymentAccountId,
                    'related_id' => $expense->id,
                    'related_type' => Expense::class,
                    'reference_number' => $expense->reference_number,
                    'voucher_number' => $voucher,
                    'entry_type' => 'credit',
                    'amount' => $expense->amount,
                    'entry_date' => $expense->expense_date,
                    'description' => 'Payment via ' . ($expense->payment_method ?? 'cash'),
                    'source_module' => 'expense',
                ]);
            }
        });
    }

    public function createJournalForCashBank(CashBankTransaction $transaction): void
    {
        $voucher = $this->generateVoucher($transaction->restaurant_id, 'cashbank');

        DB::transaction(function () use ($transaction, $voucher) {
            switch ($transaction->type) {
                case 'cash_deposit':
                case 'bank_deposit':
                    JournalEntry::create([
                        'restaurant_id' => $transaction->restaurant_id,
                        'account_id' => $transaction->account_id,
                        'related_id' => $transaction->id,
                        'related_type' => CashBankTransaction::class,
                        'reference_number' => $transaction->reference_number,
                        'voucher_number' => $voucher,
                        'entry_type' => 'debit',
                        'amount' => $transaction->amount,
                        'entry_date' => $transaction->transaction_date,
                        'description' => $transaction->type . ' deposit',
                        'source_module' => 'cash_bank',
                    ]);
                    if ($transaction->from_account_id) {
                        JournalEntry::create([
                            'restaurant_id' => $transaction->restaurant_id,
                            'account_id' => $transaction->from_account_id,
                            'related_id' => $transaction->id,
                            'related_type' => CashBankTransaction::class,
                            'reference_number' => $transaction->reference_number,
                            'voucher_number' => $voucher,
                            'entry_type' => 'credit',
                            'amount' => $transaction->amount,
                            'entry_date' => $transaction->transaction_date,
                            'description' => 'Transfer out',
                            'source_module' => 'cash_bank',
                        ]);
                    }
                    break;

                case 'cash_withdraw':
                case 'bank_withdraw':
                    JournalEntry::create([
                        'restaurant_id' => $transaction->restaurant_id,
                        'account_id' => $transaction->account_id,
                        'related_id' => $transaction->id,
                        'related_type' => CashBankTransaction::class,
                        'reference_number' => $transaction->reference_number,
                        'voucher_number' => $voucher,
                        'entry_type' => 'credit',
                        'amount' => $transaction->amount,
                        'entry_date' => $transaction->transaction_date,
                        'description' => $transaction->type . ' withdraw',
                        'source_module' => 'cash_bank',
                    ]);
                    if ($transaction->to_account_id) {
                        JournalEntry::create([
                            'restaurant_id' => $transaction->restaurant_id,
                            'account_id' => $transaction->to_account_id,
                            'related_id' => $transaction->id,
                            'related_type' => CashBankTransaction::class,
                            'reference_number' => $transaction->reference_number,
                            'voucher_number' => $voucher,
                            'entry_type' => 'debit',
                            'amount' => $transaction->amount,
                            'entry_date' => $transaction->transaction_date,
                            'description' => 'Transfer in',
                            'source_module' => 'cash_bank',
                        ]);
                    }
                    break;

                case 'transfer':
                    JournalEntry::create([
                        'restaurant_id' => $transaction->restaurant_id,
                        'account_id' => $transaction->from_account_id,
                        'related_id' => $transaction->id,
                        'related_type' => CashBankTransaction::class,
                        'reference_number' => $transaction->reference_number,
                        'voucher_number' => $voucher,
                        'entry_type' => 'credit',
                        'amount' => $transaction->amount,
                        'entry_date' => $transaction->transaction_date,
                        'description' => 'Transfer out',
                        'source_module' => 'cash_bank',
                    ]);
                    JournalEntry::create([
                        'restaurant_id' => $transaction->restaurant_id,
                        'account_id' => $transaction->to_account_id,
                        'related_id' => $transaction->id,
                        'related_type' => CashBankTransaction::class,
                        'reference_number' => $transaction->reference_number,
                        'voucher_number' => $voucher,
                        'entry_type' => 'debit',
                        'amount' => $transaction->amount,
                        'entry_date' => $transaction->transaction_date,
                        'description' => 'Transfer in',
                        'source_module' => 'cash_bank',
                    ]);
                    break;
            }
        });
    }

    protected function generateVoucher(int $restaurantId, string $prefix): string
    {
        $date = now()->format('Ymd');
        $count = JournalEntry::where('voucher_number', 'like', "{$prefix}{$date}%")
            ->where('restaurant_id', $restaurantId)
            ->count() + 1;

        return strtoupper($prefix) . '-' . $date . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    protected function getOffsetAccountId(int $restaurantId, ?string $paymentMethod): ?int
    {
        $groups = ['cash', 'bank', 'bkash', 'nagad', 'rocket'];
        $groupMap = [
            'bKash' => 'bkash',
            'Nagad' => 'nagad',
            'Rocket' => 'rocket',
        ];

        $group = $groupMap[$paymentMethod] ?? ($groups[0] ?? null);

        if ($paymentMethod && isset($groupMap[$paymentMethod])) {
            $group = $groupMap[$paymentMethod];
        } elseif (in_array($paymentMethod, $groups)) {
            $group = $paymentMethod;
        }

        $account = Account::forRestaurant($restaurantId)
            ->where('account_group', $group)
            ->where('status', 'active')
            ->first();

        return $account?->id;
    }

    protected function getDefaultExpenseAccount(int $restaurantId): ?int
    {
        $account = Account::forRestaurant($restaurantId)
            ->where('account_group', 'misc_expense')
            ->where('status', 'active')
            ->first();

        return $account?->id;
    }

    public function validateTrialBalance(int $restaurantId): bool
    {
        $debit = JournalEntry::forRestaurant($restaurantId)->where('entry_type', 'debit')->sum('amount');
        $credit = JournalEntry::forRestaurant($restaurantId)->where('entry_type', 'credit')->sum('amount');

        return abs($debit - $credit) < 0.01;
    }
}
