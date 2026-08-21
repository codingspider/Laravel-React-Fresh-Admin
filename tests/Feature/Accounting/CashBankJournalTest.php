<?php

namespace Tests\Feature\Accounting;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Accounting\Models\Account;
use Modules\Accounting\Models\CashBankTransaction;
use Modules\Accounting\Models\JournalEntry;
use Modules\Accounting\Services\AccountService;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class CashBankJournalTest extends TestCase
{
    use RefreshDatabase;

    protected Restaurant $restaurant;
    protected Restaurant $foreign;
    protected Account $cash;
    protected Account $bank;
    protected Account $foreignCash;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = $this->createRestaurant();
        $this->actingAsRestaurantOwner($this->restaurant);
        $this->createBranch($this->restaurant);

        $this->foreign = $this->createRestaurant();

        app(AccountService::class)->seedDefaultAccounts($this->restaurant->id);
        app(AccountService::class)->seedDefaultAccounts($this->foreign->id);

        $this->cash = Account::where('restaurant_id', $this->restaurant->id)->where('code', '1001')->first();
        $this->bank = Account::where('restaurant_id', $this->restaurant->id)->where('code', '1002')->first();
        $this->foreignCash = Account::where('restaurant_id', $this->foreign->id)->where('code', '1001')->first();
    }

    public function test_deposit_withdraw_and_transfer_move_balances(): void
    {
        $this->postJson('/api/cash-bank', [
            'type' => 'cash_deposit',
            'account_id' => $this->cash->id,
            'amount' => 500,
        ])->assertStatus(201);

        $this->assertEquals(500, (float) $this->cash->fresh()->current_balance);

        $this->postJson('/api/cash-bank', [
            'type' => 'cash_withdraw',
            'account_id' => $this->cash->id,
            'amount' => 200,
        ])->assertStatus(201);

        $this->assertEquals(300, (float) $this->cash->fresh()->current_balance);

        $this->postJson('/api/cash-bank', [
            'type' => 'transfer',
            'account_id' => $this->cash->id,
            'from_account_id' => $this->cash->id,
            'to_account_id' => $this->bank->id,
            'amount' => 100,
        ])->assertStatus(201);

        $this->assertEquals(200, (float) $this->cash->fresh()->current_balance);
        $this->assertEquals(100, (float) $this->bank->fresh()->current_balance);

        // Journal entries were posted for each movement.
        $this->assertSame(
            6,
            JournalEntry::where('source_module', 'cash_bank')
                ->where('restaurant_id', $this->restaurant->id)
                ->count()
        );
    }

    public function test_trial_balance_is_balanced_for_double_sided_activity(): void
    {
        // Income posts debit income / credit cash.
        $this->postJson('/api/income', [
            'source' => 'manual_income',
            'amount' => 100,
            'payment_method' => 'cash',
        ])->assertStatus(201);

        // Transfer posts credit cash / debit bank.
        $this->postJson('/api/cash-bank', [
            'type' => 'transfer',
            'from_account_id' => $this->cash->id,
            'to_account_id' => $this->bank->id,
            'amount' => 40,
        ])->assertStatus(201);

        $trial = $this->getJson('/api/journal/trial-balance')->assertOk()->json('data');

        $this->assertTrue($trial['balanced']);
        $this->assertEquals(140, $trial['total_debit']);
        $this->assertEquals(140, $trial['total_credit']);
    }

    public function test_ledger_by_account_shows_running_balance(): void
    {
        $this->postJson('/api/cash-bank', [
            'type' => 'cash_deposit',
            'account_id' => $this->cash->id,
            'amount' => 500,
        ])->assertStatus(201);
        $this->postJson('/api/cash-bank', [
            'type' => 'cash_withdraw',
            'account_id' => $this->cash->id,
            'amount' => 200,
        ])->assertStatus(201);

        $ledger = $this->getJson("/api/journal/ledger/account/{$this->cash->id}")
            ->assertOk()
            ->json('data');

        $this->assertCount(2, $ledger['entries']);
        $this->assertEquals(300, $ledger['closing_balance']);
        $this->assertEquals(500, $ledger['total_debit']);
        $this->assertEquals(200, $ledger['total_credit']);
    }

    public function test_cash_bank_rejects_foreign_accounts(): void
    {
        $this->postJson('/api/cash-bank', [
            'type' => 'cash_deposit',
            'account_id' => $this->foreignCash->id,
            'amount' => 999,
        ])->assertStatus(422);

        $this->postJson('/api/cash-bank', [
            'type' => 'transfer',
            'from_account_id' => $this->cash->id,
            'to_account_id' => $this->foreignCash->id,
            'amount' => 10,
        ])->assertStatus(422);

        // Foreign account balance untouched.
        $this->assertEquals(0, (float) $this->foreignCash->fresh()->current_balance);
    }

    public function test_cross_restaurant_transaction_is_forbidden(): void
    {
        $transaction = CashBankTransaction::create([
            'restaurant_id' => $this->foreign->id,
            'account_id' => $this->foreignCash->id,
            'type' => 'cash_deposit',
            'amount' => 50,
        ]);

        $this->getJson("/api/cash-bank/{$transaction->id}")->assertStatus(403);
        $this->putJson("/api/cash-bank/{$transaction->id}", ['notes' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/cash-bank/{$transaction->id}")->assertStatus(403);
    }

    public function test_journal_crud_and_guard(): void
    {
        $created = $this->postJson('/api/journal', [
            'account_id' => $this->cash->id,
            'entry_type' => 'debit',
            'amount' => 50,
            'description' => 'Opening adjustment',
        ])->assertStatus(201)->json('data');

        $id = $created['id'] ?? $created[0]['id'] ?? null;
        $this->assertNotNull($id);
        $this->assertDatabaseHas('accounting_journal_entries', [
            'id' => $id,
            'restaurant_id' => $this->restaurant->id,
            'amount' => 50,
        ]);

        $this->getJson("/api/journal/{$id}")->assertOk();
        $this->putJson("/api/journal/{$id}", ['description' => 'Corrected adjustment'])->assertOk();
        $this->deleteJson("/api/journal/{$id}")->assertOk();

        $foreignEntry = JournalEntry::create([
            'restaurant_id' => $this->foreign->id,
            'account_id' => $this->foreignCash->id,
            'entry_type' => 'debit',
            'amount' => 5,
            'entry_date' => now()->toDateString(),
            'voucher_number' => 'MANUAL-FOR-1',
            'source_module' => 'manual',
        ]);

        $this->getJson("/api/journal/{$foreignEntry->id}")->assertStatus(403);
        $this->putJson("/api/journal/{$foreignEntry->id}", ['description' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/journal/{$foreignEntry->id}")->assertStatus(403);
    }

    public function test_journal_multiple_entries_share_voucher(): void
    {
        $incomeAccount = Account::where('restaurant_id', $this->restaurant->id)->where('code', '3001')->first();

        $response = $this->postJson('/api/journal', [
            'entry_date' => now()->toDateString(),
            'entries' => [
                ['account_id' => $this->cash->id, 'entry_type' => 'debit', 'amount' => 100],
                ['account_id' => $incomeAccount->id, 'entry_type' => 'credit', 'amount' => 100],
            ],
        ])->assertStatus(201);

        $rows = $response->json('data');
        $this->assertCount(2, $rows);
        $this->assertSame($rows[0]['voucher_number'], $rows[1]['voucher_number']);
    }
}