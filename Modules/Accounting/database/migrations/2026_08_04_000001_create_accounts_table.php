<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('code', 20);
            $table->string('name');
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->string('account_group', 50);
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('parent_id')->references('id')->on('accounts')->nullOnDelete();
            $table->unique(['restaurant_id', 'code']);
            $table->index(['restaurant_id', 'type']);
            $table->index(['restaurant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
