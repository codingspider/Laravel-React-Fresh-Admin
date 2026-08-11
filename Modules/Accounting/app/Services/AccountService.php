<?php

namespace Modules\Accounting\Services;

use App\Models\HrmEmployee;
use Modules\Accounting\Models\Account;
use Illuminate\Support\Facades\DB;

class AccountService
{
    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = Account::query();

        if (!empty($filters['restaurant_id'])) {
            $query->forRestaurant($filters['restaurant_id']);
        }

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('code', 'like', '%' . $filters['search'] . '%');
            });
        });

        $query->when(!empty($filters['type']), function ($q) use ($filters) {
            $q->byType($filters['type']);
        });

        $query->when(!empty($filters['account_group']), function ($q) use ($filters) {
            $q->where('account_group', $filters['account_group']);
        });

        $query->when(!empty($filters['status']), function ($q) use ($filters) {
            $q->where('status', $filters['status']);
        });

        $query->when(!empty($filters['branch_id']), function ($q) use ($filters) {
            $q->where('branch_id', $filters['branch_id']);
        });

        return $query->with(['parent', 'branch:id,name'])->orderBy('code')->paginate($perPage);
    }

    public function find(int $id): ?Account
    {
        return Account::with(['parent', 'children'])->find($id);
    }

    public function create(array $data): Account
    {
        return Account::create($data);
    }

    public function update(int $id, array $data): Account
    {
        $account = Account::findOrFail($id);
        $account->update($data);
        return $account->load('parent');
    }

    public function delete(int $id): void
    {
        $account = Account::findOrFail($id);

        if ($account->is_system) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'account' => 'System accounts cannot be deleted.',
            ]);
        }

        if ($account->children()->count() > 0) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'account' => 'Cannot delete account with sub-accounts.',
            ]);
        }

        $account->delete();
    }

    public function tree(int $restaurantId): array
    {
        $accounts = Account::forRestaurant($restaurantId)
            ->where('status', 'active')
            ->orderBy('code')
            ->get();

        return $this->buildTree($accounts, null);
    }

    protected function buildTree($accounts, $parentId): array
    {
        $tree = [];
        foreach ($accounts as $account) {
            if ($account->parent_id == $parentId) {
                $children = $this->buildTree($accounts, $account->id);
                $node = $account->toArray();
                $node['children'] = $children;
                $tree[] = $node;
            }
        }
        return $tree;
    }

    public function seedDefaultAccounts(int $restaurantId): void
    {
        $defaults = [
            // Assets
            ['code' => '1001', 'name' => 'Cash', 'type' => 'asset', 'account_group' => 'cash', 'is_system' => true],
            ['code' => '1002', 'name' => 'Bank Account', 'type' => 'asset', 'account_group' => 'bank', 'is_system' => true],
            ['code' => '1003', 'name' => 'bKash', 'type' => 'asset', 'account_group' => 'bkash', 'is_system' => true],
            ['code' => '1004', 'name' => 'Nagad', 'type' => 'asset', 'account_group' => 'nagad', 'is_system' => true],
            ['code' => '1005', 'name' => 'Rocket', 'type' => 'asset', 'account_group' => 'rocket', 'is_system' => true],
            ['code' => '1006', 'name' => 'Accounts Receivable', 'type' => 'asset', 'account_group' => 'accounts_receivable', 'is_system' => true],
            ['code' => '1007', 'name' => 'Inventory', 'type' => 'asset', 'account_group' => 'inventory', 'is_system' => true],

            // Liabilities
            ['code' => '2001', 'name' => 'Accounts Payable', 'type' => 'liability', 'account_group' => 'accounts_payable', 'is_system' => true],
            ['code' => '2002', 'name' => 'Customer Advance', 'type' => 'liability', 'account_group' => 'customer_advance', 'is_system' => true],
            ['code' => '2003', 'name' => 'VAT Payable', 'type' => 'liability', 'account_group' => 'vat_payable', 'is_system' => true],

            // Income
            ['code' => '3001', 'name' => 'Food Sales', 'type' => 'income', 'account_group' => 'food_sales', 'is_system' => true],
            ['code' => '3002', 'name' => 'Beverage Sales', 'type' => 'income', 'account_group' => 'beverage_sales', 'is_system' => true],
            ['code' => '3003', 'name' => 'Delivery Charge', 'type' => 'income', 'account_group' => 'delivery_charge', 'is_system' => true],
            ['code' => '3004', 'name' => 'Other Income', 'type' => 'income', 'account_group' => 'other_income', 'is_system' => true],

            // Expenses
            ['code' => '4001', 'name' => 'Purchase', 'type' => 'expense', 'account_group' => 'purchase', 'is_system' => true],
            ['code' => '4002', 'name' => 'Salary', 'type' => 'expense', 'account_group' => 'salary', 'is_system' => true],
            ['code' => '4003', 'name' => 'Rent', 'type' => 'expense', 'account_group' => 'rent', 'is_system' => true],
            ['code' => '4004', 'name' => 'Electricity', 'type' => 'expense', 'account_group' => 'electricity', 'is_system' => true],
            ['code' => '4005', 'name' => 'Gas', 'type' => 'expense', 'account_group' => 'gas', 'is_system' => true],
            ['code' => '4006', 'name' => 'Internet', 'type' => 'expense', 'account_group' => 'internet', 'is_system' => true],
            ['code' => '4007', 'name' => 'Marketing', 'type' => 'expense', 'account_group' => 'marketing', 'is_system' => true],
            ['code' => '4008', 'name' => 'Maintenance', 'type' => 'expense', 'account_group' => 'maintenance', 'is_system' => true],
            ['code' => '4009', 'name' => 'Misc Expense', 'type' => 'expense', 'account_group' => 'misc_expense', 'is_system' => true],
        ];

        foreach ($defaults as $account) {
            $account['restaurant_id'] = $restaurantId;
            Account::updateOrCreate(
                ['restaurant_id' => $restaurantId, 'code' => $account['code']],
                $account
            );
        }
    }
}
