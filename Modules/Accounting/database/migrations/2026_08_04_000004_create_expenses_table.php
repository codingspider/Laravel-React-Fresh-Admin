<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accounting_expense_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('expense_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('attachment')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['restaurant_id', 'expense_date']);
            $table->index(['restaurant_id', 'status']);
            $table->index(['restaurant_id', 'accounting_expense_category_id'], 'expenses_cat_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_expenses');
    }
};
