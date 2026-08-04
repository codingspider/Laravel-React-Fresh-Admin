<?php

namespace Modules\Accounting\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Modules\Accounting\Services\JournalService;
use Modules\Accounting\Http\Resources\JournalEntryResource;
use Modules\Accounting\Models\Account;

class JournalController extends Controller
{
    protected $journalService;

    public function __construct(JournalService $journalService)
    {
        $this->journalService = $journalService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'search', 'account_id', 'entry_type', 'date_from', 'date_to',
        ]);
        $filters['restaurant_id'] = $request->user()->restaurant_id ?? 1;

        $entries = $this->journalService->paginate(15, $filters);

        return JournalEntryResource::collection($entries);
    }

    public function show(Request $request, int $id)
    {
        $entry = $this->journalService->find($id);

        if (!$entry) {
            return response()->json([
                'status' => 'error',
                'message' => trans('accounting::module.journal_entry_not_found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.journal_entry_fetched'),
            'data' => new JournalEntryResource($entry),
        ]);
    }

    public function ledger(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id ?? 1;
        $filters = $request->only(['account_id', 'date_from', 'date_to']);

        $ledger = $this->journalService->generalLedger($restaurantId, $filters);

        $accounts = Account::forRestaurant($restaurantId)
            ->where('type', '!=', 'heading')
            ->get(['id', 'code', 'name', 'type', 'account_group']);

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.ledger_fetched'),
            'data' => [
                'accounts' => $accounts,
                'ledger' => $ledger,
            ],
        ]);
    }

    public function ledgerByAccount(Request $request, int $accountId)
    {
        $restaurantId = $request->user()->restaurant_id ?? 1;
        $filters = $request->only(['date_from', 'date_to']);

        $account = Account::forRestaurant($restaurantId)->find($accountId);
        if (!$account) {
            return response()->json([
                'status' => 'error',
                'message' => trans('accounting::module.not_found'),
            ], 404);
        }

        $entries = \Modules\Accounting\Models\JournalEntry::forRestaurant($restaurantId)
            ->byAccount($accountId)
            ->when(!empty($filters['date_from']) && !empty($filters['date_to']), function ($q) use ($filters) {
                $q->byDateRange($filters['date_from'], $filters['date_to']);
            })
            ->with('account')
            ->orderBy('entry_date')
            ->get();

        $openingBalance = $account->opening_balance ?? 0;
        $totalDebit = 0;
        $totalCredit = 0;
        $ledger = [];
        $runningBalance = $openingBalance;

        foreach ($entries as $entry) {
            $debit = $entry->entry_type === 'debit' ? $entry->amount : 0;
            $credit = $entry->entry_type === 'credit' ? $entry->amount : 0;
            $totalDebit += $debit;
            $totalCredit += $credit;

            if ($account->type === 'asset' || $account->type === 'expense') {
                $runningBalance += $debit - $credit;
            } else {
                $runningBalance += $credit - $debit;
            }

            $ledger[] = [
                'date' => $entry->entry_date,
                'voucher_number' => $entry->voucher_number,
                'description' => $entry->description,
                'reference_number' => $entry->reference_number,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $runningBalance,
                'source_module' => $entry->source_module,
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.ledger_fetched'),
            'data' => [
                'account' => $account,
                'opening_balance' => $openingBalance,
                'entries' => $ledger,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'closing_balance' => $runningBalance,
            ],
        ]);
    }

    public function trialBalance(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id ?? 1;
        $filters = $request->only(['date_from', 'date_to']);

        $result = $this->journalService->trialBalance($restaurantId, $filters);

        return response()->json([
            'status' => 'success',
            'message' => trans('accounting::module.trial_balance_fetched'),
            'data' => $result,
        ]);
    }
}
