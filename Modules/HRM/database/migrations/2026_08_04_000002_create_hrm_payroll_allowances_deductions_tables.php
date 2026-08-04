<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('hrm_payroll_allowances')) {
            Schema::create('hrm_payroll_allowances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payroll_id')->constrained('hrm_payrolls')->cascadeOnDelete();
                $table->string('type');
                $table->decimal('amount', 12, 2)->default(0);
                $table->enum('calculation_type', ['fixed', 'percentage'])->default('fixed');
                $table->decimal('calculated_amount', 12, 2)->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('hrm_payroll_deductions')) {
            Schema::create('hrm_payroll_deductions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payroll_id')->constrained('hrm_payrolls')->cascadeOnDelete();
                $table->string('type');
                $table->decimal('amount', 12, 2)->default(0);
                $table->enum('calculation_type', ['fixed', 'percentage'])->default('fixed');
                $table->decimal('calculated_amount', 12, 2)->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('hrm_payroll_deductions');
        Schema::dropIfExists('hrm_payroll_allowances');
    }
};
