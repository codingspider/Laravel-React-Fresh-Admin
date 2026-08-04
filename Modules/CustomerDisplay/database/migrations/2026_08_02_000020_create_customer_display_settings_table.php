<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customer_display_settings')) {
            return;
        }

        Schema::create('customer_display_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('payment_qr_image')->nullable();
            $table->boolean('show_payment_qr')->default(true);
            $table->boolean('show_promotions')->default(true);
            $table->unsignedInteger('refresh_interval')->default(10);
            $table->json('active_statuses')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_display_settings');
    }
};
