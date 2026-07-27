<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->nullable()->default(0)->change();
            $table->string('tax_name')->nullable()->default('Tax')->change();
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(0)->change();
            $table->string('tax_name')->default('Tax')->change();
        });
    }
};
