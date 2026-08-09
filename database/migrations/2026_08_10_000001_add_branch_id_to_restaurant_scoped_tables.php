<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables that already have restaurant_id but no branch_id.
     * These are per-branch business data tables.
     */
    protected array $tables = [
        'accounts',
        'accounting_cash_bank_transactions',
        'accounting_expense_categories',
        'accounting_journal_entries',
        'accountings',
        'analyticss',
        'crm_follow_ups',
        'crm_notes',
        'crm_segments',
        'crms',
        'customers',
        'deliverys',
        'employees',
        'finances',
        'goods_received_notes',
        'hrm_designations',
        'inventory_batches',
        'inventory_categories',
        'inventorys',
        'invoices',
        'kots',
        'loyalty_customer_points',
        'loyalty_points_transactions',
        'loyaltys',
        'marketings',
        'menu_categories',
        'menu_items',
        'modifier_groups',
        'notifications',
        'orderss',
        'payrolls',
        'purchase_payments',
        'purchase_returns',
        'recipe_categories',
        'recipes',
        'reportss',
        'reviews',
        'shifts',
        'suppliers',
        'units',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (!Schema::hasTable($table) || Schema::hasColumn($table, 'branch_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $table) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('restaurant_id');
                $table->index('branch_id');
            });
        }

        $this->backfillMainBranch();
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'branch_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropIndex(['branch_id']);
                    $table->dropColumn('branch_id');
                });
            }
        }
    }

    protected function backfillMainBranch(): void
    {
        $branches = DB::table('branches')->select('id', 'restaurant_id')->get();

        foreach ($branches as $branch) {
            foreach ($this->tables as $table) {
                if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'branch_id')) {
                    continue;
                }

                DB::table($table)
                    ->where('restaurant_id', $branch->restaurant_id)
                    ->whereNull('branch_id')
                    ->update(['branch_id' => $branch->id]);
            }
        }
    }
};
