<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->foreignId('inventory_category_id')->nullable()->after('branch_id')->constrained()->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->after('sell_price')->constrained()->nullOnDelete();
            $table->dropColumn('sell_price');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->decimal('sell_price', 10, 2)->default(0)->after('cost_price');
            $table->dropForeign(['inventory_category_id']);
            $table->dropColumn('inventory_category_id');
            $table->dropForeign(['supplier_id']);
            $table->dropColumn('supplier_id');
        });
    }
};
