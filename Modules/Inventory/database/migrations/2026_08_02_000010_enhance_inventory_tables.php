<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->decimal('opening_stock', 12, 2)->default(0)->after('reorder_level');
            $table->decimal('current_stock', 12, 2)->default(0)->after('opening_stock');
            $table->decimal('minimum_stock', 12, 2)->default(0)->after('current_stock');
            $table->decimal('maximum_stock', 12, 2)->nullable()->after('minimum_stock');
            $table->decimal('unit_cost', 12, 2)->default(0)->after('cost_price');
            $table->decimal('selling_price', 12, 2)->nullable()->after('unit_cost');
            $table->date('expiry_date')->nullable()->after('selling_price');
            $table->boolean('track_expiry')->default(false)->after('expiry_date');
            $table->boolean('track_stock')->default(true)->after('track_expiry');
            $table->boolean('is_finished_product')->default(false)->after('track_stock');
            $table->unsignedBigInteger('menu_item_id')->nullable()->after('is_finished_product');
            $table->string('barcode')->nullable()->after('sku');
            $table->enum('type', ['raw_material', 'finished_product', 'both'])->default('raw_material')->after('barcode');
        });

        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->string('batch_number')->nullable();
            $table->decimal('quantity', 12, 2);
            $table->decimal('remaining_qty', 12, 2);
            $table->decimal('unit_cost', 12, 2);
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
            $table->index(['item_id', 'expiry_date']);
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['purchase', 'sale', 'transfer', 'adjustment', 'waste', 'expired', 'return', 'consumption']);
            $table->decimal('quantity', 12, 2);
            $table->decimal('previous_stock', 12, 2);
            $table->decimal('new_stock', 12, 2);
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->index(['restaurant_id', 'type']);
            $table->index(['item_id', 'created_at']);
        });

        Schema::create('inventory_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number')->unique();
            $table->foreignId('from_branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('to_branch_id')->constrained('branches')->cascadeOnDelete();
            $table->enum('status', ['pending', 'in_transit', 'received', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_id')->constrained('inventory_transfers')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('quantity', 12, 2);
            $table->decimal('received_quantity', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('inventory_wastes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number')->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['damage', 'expired', 'spillage', 'other'])->default('damage');
            $table->decimal('total_quantity', 12, 2)->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_waste_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('waste_id')->constrained('inventory_wastes')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('total_cost', 12, 2);
            $table->timestamps();
        });

        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number')->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['stock_take', 'damaged', 'found', 'lost', 'correction'])->default('stock_take');
            $table->decimal('total_quantity', 12, 2)->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adjustment_id')->constrained('inventory_adjustments')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('system_stock', 12, 2);
            $table->decimal('actual_stock', 12, 2);
            $table->decimal('difference', 12, 2);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('total_cost', 12, 2);
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustment_items');
        Schema::dropIfExists('inventory_adjustments');
        Schema::dropIfExists('inventory_waste_items');
        Schema::dropIfExists('inventory_wastes');
        Schema::dropIfExists('inventory_transfer_items');
        Schema::dropIfExists('inventory_transfers');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_batches');

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn([
                'opening_stock', 'current_stock', 'minimum_stock', 'maximum_stock',
                'unit_cost', 'selling_price', 'expiry_date', 'track_expiry', 'track_stock',
                'is_finished_product', 'menu_item_id', 'barcode', 'type',
            ]);
        });
    }
};