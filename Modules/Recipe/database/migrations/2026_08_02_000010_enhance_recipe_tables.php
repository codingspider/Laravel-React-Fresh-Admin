<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            if (!Schema::hasColumn('recipes', 'menu_item_id')) {
                $table->unsignedBigInteger('menu_item_id')->nullable()->after('restaurant_id');
            }
            if (!Schema::hasColumn('recipes', 'category_id')) {
                $table->unsignedBigInteger('category_id')->nullable()->after('menu_item_id');
            }
            if (!Schema::hasColumn('recipes', 'selling_price')) {
                $table->decimal('selling_price', 12, 2)->nullable()->after('description');
            }
            if (!Schema::hasColumn('recipes', 'total_cost')) {
                $table->decimal('total_cost', 12, 2)->default(0)->after('selling_price');
            }
            if (!Schema::hasColumn('recipes', 'profit_margin')) {
                $table->decimal('profit_margin', 12, 2)->nullable()->after('total_cost');
            }
            if (!Schema::hasColumn('recipes', 'profit')) {
                $table->decimal('profit', 12, 2)->nullable()->after('profit_margin');
            }
            if (!Schema::hasColumn('recipes', 'yield_quantity')) {
                $table->decimal('yield_quantity', 12, 2)->default(1)->after('profit');
            }
            if (!Schema::hasColumn('recipes', 'yield_unit_id')) {
                $table->unsignedBigInteger('yield_unit_id')->nullable()->after('yield_quantity');
            }
            if (!Schema::hasColumn('recipes', 'auto_deduct_stock')) {
                $table->enum('auto_deduct_stock', ['yes', 'no'])->default('yes')->after('yield_unit_id');
            }
            if (!Schema::hasColumn('recipes', 'preparation_notes')) {
                $table->text('preparation_notes')->nullable()->after('auto_deduct_stock');
            }
            if (!Schema::hasColumn('recipes', 'cooking_instructions')) {
                $table->text('cooking_instructions')->nullable()->after('preparation_notes');
            }
            if (!Schema::hasColumn('recipes', 'preparation_time')) {
                $table->integer('preparation_time')->nullable()->after('cooking_instructions');
            }
            if (!Schema::hasColumn('recipes', 'cooking_time')) {
                $table->integer('cooking_time')->nullable()->after('preparation_time');
            }
        });

        if (!Schema::hasTable('recipe_ingredients')) {
            Schema::create('recipe_ingredients', function (Blueprint $table) {
                $table->id();
                $table->foreignId('recipe_id')->constrained('recipes')->cascadeOnDelete();
                $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
                $table->decimal('quantity', 12, 3);
                $table->unsignedBigInteger('unit_id');
                $table->decimal('unit_cost', 12, 2)->default(0);
                $table->decimal('total_cost', 12, 2)->default(0);
                $table->boolean('is_optional')->default(false);
                $table->text('notes')->nullable();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['recipe_id', 'inventory_item_id']);
            });
        }

        if (!Schema::hasTable('recipe_categories')) {
            Schema::create('recipe_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_ingredients');
        Schema::dropIfExists('recipe_categories');

        Schema::table('recipes', function (Blueprint $table) {
            $cols = ['menu_item_id', 'category_id', 'selling_price', 'total_cost', 'profit_margin', 'profit',
                'yield_quantity', 'yield_unit_id', 'auto_deduct_stock', 'preparation_notes',
                'cooking_instructions', 'preparation_time', 'cooking_time'];
            $table->dropColumn(array_filter($cols, fn($c) => Schema::hasColumn('recipes', $c)));
        });
    }
};