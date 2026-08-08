<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('database_backups', function (Blueprint $table) {
            $table->id();
            $table->string('filename')->unique();
            $table->string('path');
            $table->unsignedBigInteger('size')->default(0);
            $table->string('status')->default('completed'); // running | completed | failed
            $table->string('type')->default('manual');      // manual | schedule
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('restored_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('database_backups');
    }
};
