<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hrm_employees', function (Blueprint $table) {
            if (!Schema::hasColumn('hrm_employees', 'overtime_rate')) {
                $table->decimal('overtime_rate', 12, 2)->nullable()->after('salary');
            }
            if (!Schema::hasColumn('hrm_employees', 'pf')) {
                $table->decimal('pf', 12, 2)->nullable()->after('overtime_rate');
            }
            if (!Schema::hasColumn('hrm_employees', 'tax')) {
                $table->decimal('tax', 12, 2)->nullable()->after('pf');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hrm_employees', function (Blueprint $table) {
            $table->dropColumn(['overtime_rate', 'pf', 'tax']);
        });
    }
};
