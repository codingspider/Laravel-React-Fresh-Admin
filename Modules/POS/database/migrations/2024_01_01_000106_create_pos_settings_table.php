<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->json('order_types')->nullable();
            $table->json('payment_methods')->nullable();
            $table->json('tax_config')->nullable();
            $table->decimal('default_tax_rate', 5, 2)->default(0);
            $table->string('default_tax_name')->nullable();
            $table->boolean('enable_discount')->default(true);
            $table->boolean('enable_coupon')->default(true);
            $table->boolean('enable_shipping')->default(true);
            $table->boolean('enable_tip')->default(false);
            $table->boolean('enable_notes')->default(true);
            $table->boolean('enable_kitchen_notes')->default(true);
            $table->boolean('enable_table_management')->default(true);
            $table->boolean('enable_customer')->default(true);
            $table->timestamps();

            $table->unique(['restaurant_id', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_settings');
    }
};
