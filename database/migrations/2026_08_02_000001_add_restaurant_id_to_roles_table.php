<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Restaurant\Models\Restaurant;

return new class extends Migration
{
    /**
     * Scope roles to a restaurant so every restaurant manages its own set of
     * roles. System roles (seeded) keep restaurant_id = null.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->unsignedBigInteger('restaurant_id')->nullable()->after('id');
            $table->index('restaurant_id', 'roles_restaurant_id_index');
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->dropUnique('roles_name_guard_name_unique');
            $table->unique(['restaurant_id', 'name', 'guard_name'], 'roles_restaurant_id_name_guard_name_unique');
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->foreign('restaurant_id')
                ->references('id')
                ->on((new Restaurant)->getTable())
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->dropUnique('roles_restaurant_id_name_guard_name_unique');
            $table->unique(['name', 'guard_name'], 'roles_name_guard_name_unique');
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->dropIndex('roles_restaurant_id_index');
            $table->dropColumn('restaurant_id');
        });
    }
};
