<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_cash_bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('from_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('to_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->enum('type', ['cash_deposit', 'cash_withdraw', 'bank_deposit', 'bank_withdraw', 'transfer']);
            $table->enum('source_destination', ['cash', 'bank'])->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('reference_number')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->date('transaction_date')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['restaurant_id', 'type']);
            $table->index(['restaurant_id', 'account_id']);
            $table->index(['restaurant_id', 'transaction_date'], 'cb_trans_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_cash_bank_transactions');
    }
};
