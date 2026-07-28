<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('floors', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->change();
        });

        Schema::table('tables', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->change();
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('floors', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable(false)->change();
        });

        Schema::table('tables', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable(false)->change();
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable(false)->change();
        });
    }
};
