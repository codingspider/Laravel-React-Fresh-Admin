<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sales') && !Schema::hasColumn('sales', 'source')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('source')->default('pos')->after('coupon_code');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sales') && Schema::hasColumn('sales', 'source')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->dropColumn('source');
            });
        }
    }
};
