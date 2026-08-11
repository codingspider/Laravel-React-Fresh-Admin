<?php

namespace Modules\Accounting\Services;

use Modules\Accounting\Models\CashBankTransaction;
use Modules\Accounting\Models\Account;
use Illuminate\Support\Facades\DB;

class CashBankService
{
    public function __construct(protected JournalService $journalService) {}
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = CashBankTransaction::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('reference_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('notes', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['type']), function ($q) use ($filters) {
            $q->byType($filters['type']);
        });

        $query->when(!empty($filters['date_from']), function ($q) use ($filters) {
            $q->where('transaction_date', '>=', $filters['date_from']);
        });

        $query->when(!empty($filters['date_to']), function ($q) use ($filters) {
            $q->where('transaction_date', '<=', $filters['date_to']);
        });

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        return $query->with(['account', 'fromAccount', 'toAccount', 'branch:id,name'])
            ->orderByDesc('transaction_date')
            ->paginate($perPage);
    }

    public function find(int $id): ?CashBankTransaction
    {
        return CashBankTransaction::with(['account', 'fromAccount', 'toAccount'])->find($id);
    }

    public function cashDeposit(array $data): CashBankTransaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = CashBankTransaction::create($data);
            $this->updateAccountBalance($data['account_id'], $data['amount']);
            $this->journalService->createJournalForCashBank($transaction);
            return $transaction->load(['account']);
        });
    }

    public function cashWithdraw(array $data): CashBankTransaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = CashBankTransaction::create($data);
            $this->updateAccountBalance($data['account_id'], -$data['amount']);
            $this->journalService->createJournalForCashBank($transaction);
            return $transaction->load(['account']);
        });
    }

    public function bankDeposit(array $data): CashBankTransaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = CashBankTransaction::create($data);
            $this->updateAccountBalance($data['account_id'], $data['amount']);
            $this->journalService->createJournalForCashBank($transaction);
            return $transaction->load(['account']);
        });
    }

    public function bankWithdraw(array $data): CashBankTransaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = CashBankTransaction::create($data);
            $this->updateAccountBalance($data['account_id'], -$data['amount']);
            $this->journalService->createJournalForCashBank($transaction);
            return $transaction->load(['account']);
        });
    }

    public function transfer(array $data): CashBankTransaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = CashBankTransaction::create($data);
            $this->updateAccountBalance($data['from_account_id'], -$data['amount']);
            $this->updateAccountBalance($data['to_account_id'], $data['amount']);
            $this->journalService->createJournalForCashBank($transaction);
            return $transaction->load(['fromAccount', 'toAccount']);
        });
    }

    protected function updateAccountBalance(int $accountId, float $amount): void
    {
        $account = Account::find($accountId);
        if ($account) {
            $account->increment('current_balance', $amount);
        }
    }

    public function cashAccounts(int $restaurantId): array
    {
        return Account::forRestaurant($restaurantId)
            ->byType('asset')
            ->whereIn('account_group', ['cash', 'bkash', 'nagad', 'rocket'])
            ->where('status', 'active')
            ->get()
            ->toArray();
    }

    public function bankAccounts(int $restaurantId): array
    {
        return Account::forRestaurant($restaurantId)
            ->byType('asset')
            ->where('account_group', 'bank')
            ->where('status', 'active')
            ->get()
            ->toArray();
    }

    public function allAssetAccounts(int $restaurantId): array
    {
        return Account::forRestaurant($restaurantId)
            ->byType('asset')
            ->whereIn('account_group', ['cash', 'bank', 'bkash', 'nagad', 'rocket', 'accounts_receivable', 'inventory'])
            ->where('status', 'active')
            ->get()
            ->toArray();
    }
}
