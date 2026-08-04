<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('suppliers')) {
            return;
        }

        $columnsToAdd = [
            'company' => fn(Blueprint $table) => $table->string('company')->nullable()->after('name'),
            'email' => fn(Blueprint $table) => $table->string('email')->nullable()->after('company'),
            'phone' => fn(Blueprint $table) => $table->string('phone')->nullable()->after('email'),
            'address' => fn(Blueprint $table) => $table->text('address')->nullable()->after('phone'),
            'city' => fn(Blueprint $table) => $table->string('city')->nullable()->after('address'),
            'country' => fn(Blueprint $table) => $table->string('country')->nullable()->after('city'),
            'notes' => fn(Blueprint $table) => $table->text('notes')->nullable()->after('country'),
            'is_active' => fn(Blueprint $table) => $table->boolean('is_active')->default(true)->after('notes'),
        ];

        Schema::table('suppliers', function (Blueprint $table) use ($columnsToAdd) {
            foreach ($columnsToAdd as $column => $definition) {
                if (!Schema::hasColumn('suppliers', $column)) {
                    $definition($table);
                }
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('suppliers')) {
            return;
        }

        Schema::table('suppliers', function (Blueprint $table) {
            $columnsToDrop = array_filter(['company', 'email', 'phone', 'address', 'city', 'country', 'notes', 'is_active'], fn($col) => Schema::hasColumn('suppliers', $col));
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
