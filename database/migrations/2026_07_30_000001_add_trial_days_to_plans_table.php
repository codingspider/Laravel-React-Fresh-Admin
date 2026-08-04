<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('plans') && !Schema::hasColumn('plans', 'trial_days')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->integer('trial_days')->default(0)->after('invoice_limit');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('plans') && Schema::hasColumn('plans', 'trial_days')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropColumn('trial_days');
            });
        }
    }
};
