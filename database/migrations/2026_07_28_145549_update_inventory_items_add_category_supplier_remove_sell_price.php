<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('inventory_items')) {
            return;
        }

        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'inventory_category_id')) {
                $table->foreignId('inventory_category_id')->nullable()->after('branch_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('inventory_items', 'supplier_id')) {
                $table->foreignId('supplier_id')->nullable()->after('sell_price')->constrained()->nullOnDelete();
            }
            if (Schema::hasColumn('inventory_items', 'sell_price')) {
                $table->dropColumn('sell_price');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('inventory_items')) {
            return;
        }

        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'sell_price')) {
                $table->decimal('sell_price', 10, 2)->default(0)->after('cost_price');
            }
            if (Schema::hasColumn('inventory_items', 'inventory_category_id')) {
                $table->dropForeign(['inventory_category_id']);
                $table->dropColumn('inventory_category_id');
            }
            if (Schema::hasColumn('inventory_items', 'supplier_id')) {
                $table->dropForeign(['supplier_id']);
                $table->dropColumn('supplier_id');
            }
        });
    }
};
