<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('accounting_expense_categories')) {
            return;
        }

        if (!Schema::hasColumn('accounting_expense_categories', 'branch_id')) {
            Schema::table('accounting_expense_categories', function (Blueprint $table) {
                $table->foreignId('branch_id')->nullable()->after('restaurant_id')->constrained()->nullOnDelete();
                $table->index('branch_id');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('accounting_expense_categories')) {
            return;
        }

        if (Schema::hasColumn('accounting_expense_categories', 'branch_id')) {
            Schema::table('accounting_expense_categories', function (Blueprint $table) {
                $table->dropForeign(['branch_id']);
                $table->dropColumn('branch_id');
            });
        }
    }
};
