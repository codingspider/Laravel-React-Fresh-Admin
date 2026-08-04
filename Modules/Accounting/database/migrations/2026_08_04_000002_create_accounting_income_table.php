<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_income', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('source', ['pos_sale', 'manual_income', 'other_income'])->default('manual_income');
            $table->string('category')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('income_date')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['restaurant_id', 'source']);
            $table->index(['restaurant_id', 'income_date']);
            $table->index(['restaurant_id', 'account_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_income');
    }
};
