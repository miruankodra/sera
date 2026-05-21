<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('greenhouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trigger_sensor_id')->constrained('sensors')->cascadeOnDelete();
            $table->string('operator');
            $table->decimal('threshold', 10, 4);
            $table->foreignId('action_device_id')->constrained('devices')->cascadeOnDelete();
            $table->string('action');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_rules');
    }
};
