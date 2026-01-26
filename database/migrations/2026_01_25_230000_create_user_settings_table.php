<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Notification preferences
            $table->boolean('email_grades')->default(true);
            $table->boolean('email_courses')->default(true);
            $table->boolean('email_announcements')->default(false);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('sms_alerts')->default(false);

            // Appearance preferences
            $table->string('theme')->default('system'); // light, dark, system
            $table->boolean('compact_mode')->default(false);
            $table->boolean('animations')->default(true);

            // Localization
            $table->string('language')->default('en');
            $table->string('timezone')->default('America/New_York');

            $table->timestamps();

            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
