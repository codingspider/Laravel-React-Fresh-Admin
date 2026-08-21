<?php

namespace Tests\Feature\Accounting;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Accounting\Models\Account;
use Modules\Accounting\Models\ExpenseCategory;
use Modules\Accounting\Models\Income;
use Modules\Accounting\Services\AccountService;
use Modules\Restaurant\Models\Restaurant;
use Tests\TestCase;

class AccountingCrudTest extends TestCase
{
    use RefreshDatabase;

    protected Restaurant $restaurant;
    protected Restaurant $foreign;
    protected Account $cash;
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
        $this->foreignCash = Account::where('restaurant_id', $this->foreign->id)->where('code', '1001')->first();
    }

    public function test_account_crud_and_tree(): void
    {
        $created = $this->postJson('/api/accounts', [
            'code' => '5001',
            'name' => 'Platform Fees',
            'type' => 'expense',
            'account_group' => 'misc_expense',
        ])->assertStatus(201)->json('data');

        $id = $created['id'];
        $this->assertDatabaseHas('accounts', [
            'id' => $id,
            'restaurant_id' => $this->restaurant->id,
            'code' => '5001',
        ]);

        $this->getJson("/api/accounts/{$id}")->assertOk()->assertJsonPath('data.name', 'Platform Fees');

        $this->putJson("/api/accounts/{$id}", ['name' => 'Marketplace Fees'])->assertOk();

        $tree = $this->getJson('/api/accounts/tree')->assertOk()->json('data');
        $this->assertNotEmpty($tree);

        $this->deleteJson("/api/accounts/{$id}")->assertOk();
        $this->assertSoftDeleted('accounts', ['id' => $id]);
    }

    public function test_system_account_cannot_be_deleted(): void
    {
        $this->deleteJson("/api/accounts/{$this->cash->id}")->assertStatus(422);
    }

    public function test_cross_restaurant_account_is_forbidden(): void
    {
        $this->getJson("/api/accounts/{$this->foreignCash->id}")->assertStatus(403);
        $this->putJson("/api/accounts/{$this->foreignCash->id}", ['name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/accounts/{$this->foreignCash->id}")->assertStatus(403);
    }

    public function test_expense_category_crud_and_guard(): void
    {
        $created = $this->postJson('/api/expense-categories', [
            'name' => 'Utilities',
        ])->assertStatus(201)->json('data');

        $id = $created['id'];
        $this->assertDatabaseHas('accounting_expense_categories', [
            'id' => $id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $this->getJson("/api/expense-categories/{$id}")->assertOk();
        $this->putJson("/api/expense-categories/{$id}", ['name' => 'Utilities & Bills'])->assertOk();
        $this->deleteJson("/api/expense-categories/{$id}")->assertOk();
        $this->assertSoftDeleted('accounting_expense_categories', ['id' => $id]);

        $foreignCategory = ExpenseCategory::create(['restaurant_id' => $this->foreign->id, 'name' => 'Foreign Cat']);

        $this->getJson("/api/expense-categories/{$foreignCategory->id}")->assertStatus(403);
        $this->putJson("/api/expense-categories/{$foreignCategory->id}", ['name' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/expense-categories/{$foreignCategory->id}")->assertStatus(403);
    }

    public function test_income_crud_posts_journal_and_summary(): void
    {
        $income = $this->postJson('/api/income', [
            'source' => 'manual_income',
            'amount' => 100,
            'payment_method' => 'cash',
        ])->assertStatus(201)->json('data');

        $this->assertDatabaseHas('accounting_income', [
            'id' => $income['id'],
            'restaurant_id' => $this->restaurant->id,
            'amount' => 100,
        ]);

        // Double-entry: debit income account, credit cash.
        $entries = \Modules\Accounting\Models\JournalEntry::where('related_type', Income::class)
            ->where('related_id', $income['id'])
            ->get();
        $this->assertSame(2, $entries->count());
        $this->assertEquals(100, $entries->where('entry_type', 'debit')->sum('amount'));
        $this->assertEquals(100, $entries->where('entry_type', 'credit')->sum('amount'));

        $summary = $this->getJson('/api/income/summary')->assertOk()->json('data');
        $this->assertEquals(100, $summary['manual_income']);

        $this->getJson("/api/income/{$income['id']}")->assertOk();
        $this->putJson("/api/income/{$income['id']}", ['notes' => 'Catering gig'])->assertOk();
        $this->deleteJson("/api/income/{$income['id']}")->assertOk();
        $this->assertSoftDeleted('accounting_income', ['id' => $income['id']]);
    }

    public function test_income_rejects_foreign_account(): void
    {
        $this->postJson('/api/income', [
            'source' => 'manual_income',
            'amount' => 100,
            'account_id' => $this->foreignCash->id,
        ])->assertStatus(422);
    }

    public function test_expense_crud_posts_journal_and_summary(): void
    {
        $categoryId = $this->postJson('/api/expense-categories', ['name' => 'Rent'])
            ->assertStatus(201)->json('data.id');

        $expense = $this->postJson('/api/expenses', [
            'accounting_expense_category_id' => $categoryId,
            'amount' => 40,
            'payment_method' => 'cash',
            'status' => 'approved',
        ])->assertStatus(201)->json('data');

        $this->assertDatabaseHas('accounting_expenses', [
            'id' => $expense['id'],
            'restaurant_id' => $this->restaurant->id,
            'amount' => 40,
        ]);

        // Double-entry: debit expense account (default misc), credit cash.
        $entries = \Modules\Accounting\Models\JournalEntry::where('related_type', \Modules\Accounting\Models\Expense::class)
            ->where('related_id', $expense['id'])
            ->get();
        $this->assertSame(2, $entries->count());
        $this->assertEquals(40, $entries->where('entry_type', 'debit')->sum('amount'));

        $summary = $this->getJson('/api/expenses/summary')->assertOk()->json('data');
        $this->assertEquals(40, $summary['total']);
        $this->assertEquals(40, $summary['by_category'][$categoryId]);

        $this->deleteJson("/api/expenses/{$expense['id']}")->assertOk();
    }

    public function test_cross_restaurant_income_and_expense_are_forbidden(): void
    {
        $foreignIncome = Income::create([
            'restaurant_id' => $this->foreign->id,
            'source' => 'manual_income',
            'amount' => 10,
        ]);
        $foreignExpense = \Modules\Accounting\Models\Expense::create([
            'restaurant_id' => $this->foreign->id,
            'amount' => 5,
        ]);

        $this->getJson("/api/income/{$foreignIncome->id}")->assertStatus(403);
        $this->putJson("/api/income/{$foreignIncome->id}", ['notes' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/income/{$foreignIncome->id}")->assertStatus(403);

        $this->getJson("/api/expenses/{$foreignExpense->id}")->assertStatus(403);
        $this->putJson("/api/expenses/{$foreignExpense->id}", ['notes' => 'Hijack'])->assertStatus(403);
        $this->deleteJson("/api/expenses/{$foreignExpense->id}")->assertStatus(403);
    }
}