<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'branch_id')) {
                $table->unsignedInteger('branch_id')->nullable()->after('business_id');
            }

            if (!Schema::hasColumn('products', 'sequence_index')) {
                $table->unsignedInteger('sequence_index')->nullable()->after('category_id');
            }

            if (!Schema::hasColumn('products', 'subtitle')) {
                $table->string('subtitle')->nullable()->after('name');
            }

            if (!Schema::hasColumn('products', 'main_image')) {
                $table->string('main_image')->nullable()->after('image');
            }

            if (!Schema::hasColumn('products', 'item_available_for')) {
                $table->json('item_available_for')->nullable()->after('product_description');
            }

            if (!Schema::hasColumn('products', 'featured_item')) {
                $table->boolean('featured_item')->default(false)->after('item_available_for');
            }

            if (!Schema::hasColumn('products', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('featured_item');
            }

            if (!Schema::hasColumn('products', 'variations')) {
                $table->json('variations')->nullable()->after('is_active');
            }

            if (!Schema::hasColumn('products', 'addons')) {
                $table->json('addons')->nullable()->after('variations');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $columns = [
                'branch_id',
                'sequence_index',
                'subtitle',
                'main_image',
                'item_available_for',
                'featured_item',
                'is_active',
                'variations',
                'addons',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('products', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
