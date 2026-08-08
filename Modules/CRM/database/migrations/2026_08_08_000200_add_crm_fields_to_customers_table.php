<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add CRM-specific columns to the customers table.
     */
    public function up(): void
    {
        if (!Schema::hasTable('customers')) {
            return;
        }

        Schema::table('customers', function (Blueprint $table) {
            $columns = [
                'dob' => fn () => $table->date('dob')->nullable()->after('notes'),
                'anniversary' => fn () => $table->date('anniversary')->nullable()->after('dob'),
                'gender' => fn () => $table->string('gender')->nullable()->after('anniversary'),
                'favourite_food' => fn () => $table->string('favourite_food')->nullable()->after('gender'),
                'source' => fn () => $table->string('source')->default('manual')->after('favourite_food'),
                'lead_status' => fn () => $table->string('lead_status')->nullable()->after('source'),
                'last_visit_at' => fn () => $table->timestamp('last_visit_at')->nullable()->after('lead_status'),
                'total_spent' => fn () => $table->decimal('total_spent', 14, 2)->default(0)->after('last_visit_at'),
                'total_orders' => fn () => $table->unsignedInteger('total_orders')->default(0)->after('total_spent'),
            ];

            foreach ($columns as $column => $definition) {
                if (!Schema::hasColumn('customers', $column)) {
                    $definition();
                }
            }
        });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        if (!Schema::hasTable('customers')) {
            return;
        }

        Schema::table('customers', function (Blueprint $table) {
            $columnsToDrop = array_filter([
                'dob',
                'anniversary',
                'gender',
                'favourite_food',
                'source',
                'lead_status',
                'last_visit_at',
                'total_spent',
                'total_orders',
            ], fn (string $column) => Schema::hasColumn('customers', $column));

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
