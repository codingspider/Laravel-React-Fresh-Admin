<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sales') && Schema::hasColumn('sales', 'branch_id')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->foreignId('branch_id')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sales') && Schema::hasColumn('sales', 'branch_id')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->foreignId('branch_id')->nullable(false)->change();
            });
        }
    }
};
