<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_points_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('loyalty_id')->nullable()->constrained('loyaltys')->nullOnDelete();
            $table->enum('type', ['earn', 'redeem', 'adjust', 'expire', 'restore'])->index();
            $table->integer('points');
            $table->unsignedInteger('balance_after')->default(0);
            $table->unsignedBigInteger('sale_id')->nullable()->index();
            $table->string('reference')->nullable();
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('customer_id');
            $table->index(['sale_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_points_transactions');
    }
};
