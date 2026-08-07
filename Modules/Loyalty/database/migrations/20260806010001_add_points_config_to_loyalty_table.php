<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loyaltys', function (Blueprint $table) {
            $table->unsignedInteger('points_per_order')->default(10)->after('status');
            $table->decimal('currency_per_point', 12, 4)->default(0.0100)->after('points_per_order');
            $table->decimal('min_order_amount', 12, 2)->nullable()->after('currency_per_point');
            $table->unsignedInteger('min_points_required')->default(0)->after('min_order_amount');
            $table->decimal('max_redeem_percent', 5, 2)->nullable()->after('min_points_required');
            $table->unsignedInteger('points_expiry_days')->nullable()->after('max_redeem_percent');
            $table->boolean('enable_earning')->default(true)->after('points_expiry_days');
            $table->boolean('enable_redemption')->default(true)->after('enable_earning');
        });
    }

    public function down(): void
    {
        Schema::table('loyaltys', function (Blueprint $table) {
            $table->dropColumn([
                'points_per_order',
                'currency_per_point',
                'min_order_amount',
                'min_points_required',
                'max_redeem_percent',
                'points_expiry_days',
                'enable_earning',
                'enable_redemption',
            ]);
        });
    }
};
