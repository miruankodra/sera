<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('password');
            $table->string('timezone')->default('UTC')->after('avatar');
            $table->string('locale')->default('sq')->after('timezone');
            $table->json('notification_preferences')->nullable()->after('locale');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'timezone', 'locale', 'notification_preferences']);
        });
    }
};
