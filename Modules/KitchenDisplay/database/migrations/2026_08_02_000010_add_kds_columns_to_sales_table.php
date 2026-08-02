<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add Kitchen Display System (KDS) columns to the POS sales table.
     *
     * These columns power the live kitchen dashboard:
     * - priority: low / normal / high / urgent order priority queue
     * - chef_user_id: the chef currently working this order
     * - started_at: when cooking began (drives the preparation timer)
     * - ready_at: when the order was marked ready
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('status');
            $table->foreignId('chef_user_id')->nullable()->after('priority')->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable()->after('chef_user_id');
            $table->timestamp('ready_at')->nullable()->after('started_at');

            $table->index(['restaurant_id', 'status', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['restaurant_id', 'status', 'priority']);
            $table->dropColumn(['priority', 'chef_user_id', 'started_at', 'ready_at']);
        });
    }
};
