<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('related_id')->nullable();
            $table->string('related_type')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('voucher_number')->nullable();
            $table->enum('entry_type', ['debit', 'credit']);
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('entry_date')->nullable();
            $table->text('description')->nullable();
            $table->string('source_module')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['restaurant_id', 'account_id']);
            $table->index(['restaurant_id', 'entry_date']);
            $table->index(['restaurant_id', 'voucher_number']);
            $table->index(['restaurant_id', 'source_module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_journal_entries');
    }
};
