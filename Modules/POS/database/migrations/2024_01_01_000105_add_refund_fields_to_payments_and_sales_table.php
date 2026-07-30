<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('type', ['sale', 'refund'])->default('sale')->after('payment_method');
            $table->text('refund_reason')->nullable()->after('notes');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('refund_amount', 10, 2)->default(0)->after('amount_paid');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['type', 'refund_reason']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('refund_amount');
        });
    }
};
