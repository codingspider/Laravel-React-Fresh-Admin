<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tables') && !Schema::hasColumn('tables', 'qr_token')) {
            Schema::table('tables', function (Blueprint $table) {
                $table->string('qr_token', 64)->nullable()->unique()->after('name');
                $table->string('qr_code_url')->nullable()->after('qr_token');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tables') && Schema::hasColumn('tables', 'qr_token')) {
            Schema::table('tables', function (Blueprint $table) {
                $table->dropColumn(['qr_token', 'qr_code_url']);
            });
        }
    }
};
