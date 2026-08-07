<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_customer_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('loyalty_id')->nullable()->constrained('loyaltys')->nullOnDelete();
            $table->unsignedInteger('points_balance')->default(0);
            $table->unsignedInteger('lifetime_points')->default(0);
            $table->unsignedInteger('total_redeemed')->default(0);
            $table->timestamp('last_earned_at')->nullable();
            $table->timestamp('last_redeemed_at')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'customer_id']);
            $table->index('customer_id');
            $table->index('loyalty_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_customer_points');
    }
};
