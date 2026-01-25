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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('type')->default('general'); // academic, deadline, meeting, class, exam, holiday, etc.
            $table->string('color')->nullable(); // For calendar display
            $table->string('visibility')->default('public'); // public, students, staff, private

            // Polymorphic relationship for event owner/creator
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            // Optional association to specific entities
            $table->foreignId('term_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('course_section_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('cascade');

            // Recurrence support
            $table->string('recurrence_rule')->nullable(); // iCal RRULE format
            $table->foreignId('parent_event_id')->nullable()->constrained('events')->onDelete('cascade');

            // Reminders
            $table->integer('reminder_minutes')->nullable();
            $table->boolean('reminder_sent')->default(false);

            $table->boolean('is_cancelled')->default(false);
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index(['start_time', 'end_time']);
            $table->index(['type', 'visibility']);
            $table->index('term_id');
        });

        // Pivot table for event attendees/subscribers
        Schema::create('event_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('attending'); // attending, maybe, declined
            $table->boolean('reminded')->default(false);
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_user');
        Schema::dropIfExists('events');
    }
};
