<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained()->cascadeOnDelete();
            $table->decimal('value', 10, 4);
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['sensor_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_readings');
    }
};
