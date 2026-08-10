<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('notification_settings')) {
            return;
        }

        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->json('config')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'branch_id']);
        });

        $this->importLegacySettings();
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }

    /**
     * Carry over the legacy restaurant-level notification_settings JSON into
     * the new branch-aware table (attached to the main branch) so nothing is
     * lost during the upgrade.
     */
    protected function importLegacySettings(): void
    {
        $restaurants = DB::table('restaurants')->whereNotNull('notification_settings')->get();

        foreach ($restaurants as $restaurant) {
            $settings = json_decode((string) $restaurant->notification_settings, true);

            if (!is_array($settings) || $settings === []) {
                continue;
            }

            $branchId = DB::table('branches')
                ->where('restaurant_id', $restaurant->id)
                ->where('is_main', true)
                ->value('id');

            DB::table('notification_settings')->insertOrIgnore([
                'restaurant_id' => $restaurant->id,
                'branch_id' => $branchId,
                'config' => json_encode($settings),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
