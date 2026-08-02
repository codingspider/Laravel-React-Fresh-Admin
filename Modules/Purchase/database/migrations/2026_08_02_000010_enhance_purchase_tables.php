<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure the purchases table has the ERP columns (idempotent)
        Schema::table('purchases', function (Blueprint $table) {
            if (!Schema::hasColumn('purchases', 'supplier_id')) {
                $table->unsignedBigInteger('supplier_id')->nullable()->after('restaurant_id');
            }
            if (!Schema::hasColumn('purchases', 'reference_number')) {
                $table->string('reference_number')->unique()->nullable()->after('supplier_id');
            }
            if (!Schema::hasColumn('purchases', 'invoice_number')) {
                $table->string('invoice_number')->nullable()->after('reference_number');
            }
            if (!Schema::hasColumn('purchases', 'purchase_date')) {
                $table->date('purchase_date')->nullable()->after('invoice_number');
            }
            if (!Schema::hasColumn('purchases', 'expected_delivery_date')) {
                $table->date('expected_delivery_date')->nullable()->after('purchase_date');
            }
            if (!Schema::hasColumn('purchases', 'order_type')) {
                $table->enum('order_type', ['purchase_order', 'direct_purchase'])->default('purchase_order')->after('expected_delivery_date');
            }
            if (!Schema::hasColumn('purchases', 'subtotal')) {
                $table->decimal('subtotal', 12, 2)->default(0)->after('order_type');
            }
            if (!Schema::hasColumn('purchases', 'tax_amount')) {
                $table->decimal('tax_amount', 12, 2)->default(0)->after('subtotal');
            }
            if (!Schema::hasColumn('purchases', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('tax_amount');
            }
            if (!Schema::hasColumn('purchases', 'shipping_cost')) {
                $table->decimal('shipping_cost', 12, 2)->default(0)->after('discount_amount');
            }
            if (!Schema::hasColumn('purchases', 'total')) {
                $table->decimal('total', 12, 2)->default(0)->after('shipping_cost');
            }
            if (!Schema::hasColumn('purchases', 'paid_amount')) {
                $table->decimal('paid_amount', 12, 2)->default(0)->after('total');
            }
            if (!Schema::hasColumn('purchases', 'due_amount')) {
                $table->decimal('due_amount', 12, 2)->default(0)->after('paid_amount');
            }
            if (!Schema::hasColumn('purchases', 'branch_id')) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('due_amount');
            }
            if (!Schema::hasColumn('purchases', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('branch_id');
            }
            if (!Schema::hasColumn('purchases', 'terms')) {
                $table->text('terms')->nullable();
            }
            if (!Schema::hasColumn('purchases', 'notes')) {
                $table->text('notes')->nullable();
            }
        });

        // Purchase Items
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->string('item_name');
            $table->decimal('quantity', 12, 2);
            $table->decimal('received_quantity', 12, 2)->default(0);
            $table->decimal('rejected_quantity', 12, 2)->default(0);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Goods Received Note
        Schema::create('goods_received_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnDelete();
            $table->string('grn_number')->unique();
            $table->date('received_date');
            $table->enum('status', ['pending', 'partial', 'completed', 'rejected'])->default('pending');
            $table->decimal('total_quantity', 12, 2)->default(0);
            $table->decimal('total_received', 12, 2)->default(0);
            $table->decimal('total_rejected', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('storage_location')->nullable();
            $table->foreignId('received_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('grn_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grn_id')->constrained('goods_received_notes')->cascadeOnDelete();
            $table->foreignId('purchase_item_id')->constrained('purchase_items')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('ordered_quantity', 12, 2);
            $table->decimal('received_quantity', 12, 2);
            $table->decimal('rejected_quantity', 12, 2)->default(0);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('total_cost', 12, 2);
            $table->string('batch_number')->nullable();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Purchase Returns
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('return_number')->unique();
            $table->date('return_date');
            $table->enum('type', ['return', 'debit_note'])->default('return');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('purchase_returns')->cascadeOnDelete();
            $table->foreignId('purchase_item_id')->nullable()->constrained('purchase_items')->nullOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->string('item_name');
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('total', 12, 2);
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        // Purchase Payments
        Schema::create('purchase_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('payment_number')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'card', 'other'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->index(['supplier_id', 'payment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_payments');
        Schema::dropIfExists('purchase_return_items');
        Schema::dropIfExists('purchase_returns');
        Schema::dropIfExists('grn_items');
        Schema::dropIfExists('goods_received_notes');
        Schema::dropIfExists('purchase_items');
    }
};