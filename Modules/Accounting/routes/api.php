<?php

use Illuminate\Support\Facades\Route;
use Modules\Accounting\Http\Controllers\AccountController;
use Modules\Accounting\Http\Controllers\IncomeController;
use Modules\Accounting\Http\Controllers\ExpenseController;
use Modules\Accounting\Http\Controllers\ExpenseCategoryController;
use Modules\Accounting\Http\Controllers\CashBankController;
use Modules\Accounting\Http\Controllers\JournalController;

Route::prefix('api')->middleware(['api', 'cookie.filter', 'auth:sanctum', 'check_active_business', 'module.access', 'restaurant.scope'])->group(function () {
    Route::get('accounts/tree', [AccountController::class, 'tree']);
    Route::apiResource('accounts', AccountController::class);

    Route::get('income/summary', [IncomeController::class, 'summary']);
    Route::apiResource('income', IncomeController::class);

    Route::get('expense/summary', [ExpenseController::class, 'summary']);
    Route::apiResource('expenses', ExpenseController::class);

    Route::apiResource('expense-categories', ExpenseCategoryController::class);

    Route::get('cash-bank/accounts', [CashBankController::class, 'accounts']);
    Route::apiResource('cash-bank', CashBankController::class);

    Route::get('journal/ledger', [JournalController::class, 'ledger']);
    Route::get('journal/ledger/account/{account}', [JournalController::class, 'ledgerByAccount']);
    Route::get('journal/trial-balance', [JournalController::class, 'trialBalance']);
    Route::apiResource('journal', JournalController::class)->only(['index', 'show']);
});
