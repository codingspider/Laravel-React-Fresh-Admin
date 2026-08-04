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
        if (!Schema::hasTable('sales')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'priority')) {
                $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('status');
            }
            if (!Schema::hasColumn('sales', 'chef_user_id')) {
                $table->foreignId('chef_user_id')->nullable()->after('priority')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('sales', 'started_at')) {
                $table->timestamp('started_at')->nullable()->after('chef_user_id');
            }
            if (!Schema::hasColumn('sales', 'ready_at')) {
                $table->timestamp('ready_at')->nullable()->after('started_at');
            }

            if (!Schema::hasIndex('sales', 'restaurant_id_status_priority_index')) {
                $table->index(['restaurant_id', 'status', 'priority']);
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('sales')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasIndex('sales', 'restaurant_id_status_priority_index')) {
                $table->dropIndex(['restaurant_id', 'status', 'priority']);
            }
            $columnsToDrop = array_filter(['priority', 'chef_user_id', 'started_at', 'ready_at'], function ($col) {
                return Schema::hasColumn('sales', $col);
            });
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
