<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $rolesTable = $tableNames['roles'];

        if (!Schema::hasTable($rolesTable)) {
            return;
        }

        if (!Schema::hasColumn($rolesTable, 'branch_id')) {
            Schema::table($rolesTable, function (Blueprint $table) {
                $table->foreignId('branch_id')->nullable()->after('restaurant_id')->constrained()->nullOnDelete();
                $table->index('branch_id');
            });
        }

        // Drop the old unique constraint if it exists and add new one with branch_id
        if (Schema::hasIndex($rolesTable, 'roles_restaurant_id_name_guard_name_unique')) {
            Schema::table($rolesTable, function (Blueprint $table) {
                $table->dropUnique('roles_restaurant_id_name_guard_name_unique');
                $table->unique(['restaurant_id', 'branch_id', 'name', 'guard_name'], 'roles_restaurant_branch_name_guard_unique');
            });
        }
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $rolesTable = $tableNames['roles'];

        if (!Schema::hasTable($rolesTable)) {
            return;
        }

        if (Schema::hasIndex($rolesTable, 'roles_restaurant_branch_name_guard_unique')) {
            Schema::table($rolesTable, function (Blueprint $table) {
                $table->dropUnique('roles_restaurant_branch_name_guard_unique');
                $table->unique(['restaurant_id', 'name', 'guard_name'], 'roles_restaurant_id_name_guard_name_unique');
            });
        }

        if (Schema::hasColumn($rolesTable, 'branch_id')) {
            Schema::table($rolesTable, function (Blueprint $table) {
                $table->dropForeign(['branch_id']);
                $table->dropColumn('branch_id');
            });
        }
    }
};
