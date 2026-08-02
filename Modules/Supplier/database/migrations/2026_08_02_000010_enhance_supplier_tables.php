<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'code')) {
                $table->string('code')->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('suppliers', 'contact_person')) {
                $table->string('contact_person')->nullable()->after('company');
            }
            if (!Schema::hasColumn('suppliers', 'alternate_phone')) {
                $table->string('alternate_phone')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('suppliers', 'state')) {
                $table->string('state')->nullable()->after('city');
            }
            if (!Schema::hasColumn('suppliers', 'zip_code')) {
                $table->string('zip_code')->nullable()->after('state');
            }
            if (!Schema::hasColumn('suppliers', 'tax_number')) {
                $table->string('tax_number')->nullable()->after('country');
            }
            if (!Schema::hasColumn('suppliers', 'gst_number')) {
                $table->string('gst_number')->nullable()->after('tax_number');
            }
            if (!Schema::hasColumn('suppliers', 'opening_balance')) {
                $table->decimal('opening_balance', 15, 2)->default(0)->after('gst_number');
            }
            if (!Schema::hasColumn('suppliers', 'credit_limit')) {
                $table->decimal('credit_limit', 12, 2)->nullable()->after('opening_balance');
            }
            if (!Schema::hasColumn('suppliers', 'payment_terms')) {
                $table->integer('payment_terms')->default(0)->after('credit_limit');
            }
            if (!Schema::hasColumn('suppliers', 'bank_details')) {
                $table->text('bank_details')->nullable()->after('payment_terms');
            }
            if (!Schema::hasColumn('suppliers', 'delivery_address')) {
                $table->text('delivery_address')->nullable()->after('bank_details');
            }
        });

        Schema::create('supplier_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('title');
            $table->string('document_type');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->index(['supplier_id', 'document_type']);
        });

        Schema::create('supplier_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->enum('type', ['purchase', 'payment', 'return', 'debit_note', 'credit_note', 'adjustment']);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_number')->nullable();
            $table->decimal('debit', 12, 2)->default(0);
            $table->decimal('credit', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['supplier_id', 'transaction_date']);
        });

        Schema::create('supplier_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->tinyInteger('quality_rating')->nullable();
            $table->tinyInteger('delivery_rating')->nullable();
            $table->tinyInteger('price_rating')->nullable();
            $table->tinyInteger('overall_rating')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['supplier_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_ratings');
        Schema::dropIfExists('supplier_transactions');
        Schema::dropIfExists('supplier_documents');
        Schema::dropIfExists('supplier_contacts');

        Schema::table('suppliers', function (Blueprint $table) {
            $cols = ['code', 'contact_person', 'alternate_phone', 'state', 'zip_code',
                'tax_number', 'gst_number', 'opening_balance', 'credit_limit',
                'payment_terms', 'bank_details', 'delivery_address'];
            $table->dropColumn(array_filter($cols, fn($c) => Schema::hasColumn('suppliers', $c)));
        });
    }
};