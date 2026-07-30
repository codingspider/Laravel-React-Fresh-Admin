<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('code', 100);
            $table->enum('type', ['fixed', 'percent'])->default('fixed');
            $table->decimal('value', 12, 2)->default(0);
            $table->decimal('min_order_amount', 12, 2)->default(0);
            $table->decimal('max_discount_amount', 12, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('per_customer_limit')->nullable();
            $table->boolean('is_active')->default(true);
            $table->datetime('starts_at')->nullable();
            $table->datetime('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['restaurant_id', 'code']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
