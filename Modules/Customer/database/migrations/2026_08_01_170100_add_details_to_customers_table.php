<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('customers')) {
            return;
        }

        Schema::table('customers', function (Blueprint $table) {
            $columnsToAdd = ['company', 'email', 'phone', 'address', 'city', 'country', 'notes', 'is_active'];
            foreach ($columnsToAdd as $column) {
                if (!Schema::hasColumn('customers', $column)) {
                    match ($column) {
                        'company' => $table->string('company')->nullable()->after('name'),
                        'email' => $table->string('email')->nullable()->after('company'),
                        'phone' => $table->string('phone')->nullable()->after('email'),
                        'address' => $table->text('address')->nullable()->after('phone'),
                        'city' => $table->string('city')->nullable()->after('address'),
                        'country' => $table->string('country')->nullable()->after('city'),
                        'notes' => $table->text('notes')->nullable()->after('country'),
                        'is_active' => $table->boolean('is_active')->default(true)->after('notes'),
                    };
                }
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('customers')) {
            return;
        }

        Schema::table('customers', function (Blueprint $table) {
            $columnsToDrop = array_filter(['company', 'email', 'phone', 'address', 'city', 'country', 'notes', 'is_active'], fn($col) => Schema::hasColumn('customers', $col));
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
