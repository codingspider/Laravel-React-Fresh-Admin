<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hrm_payrolls', function (Blueprint $table) {
            $table->decimal('total_working_hours', 8, 2)->default(0)->after('present_days');
        });
    }

    public function down(): void
    {
        Schema::table('hrm_payrolls', function (Blueprint $table) {
            $table->dropColumn('total_working_hours');
        });
    }
};
