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
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_section_id')->constrained('course_sections')->onDelete('cascade');
            $table->integer('session_number');
            $table->date('session_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->string('cancellation_reason')->nullable();
            $table->string('location_override')->nullable();
            $table->foreignId('substitute_instructor_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['course_section_id', 'session_date']);
            $table->index(['session_date', 'status']);
            $table->unique(['course_section_id', 'session_number'], 'unique_section_session_number');
        });

        // Add class_session_id to attendance_records for linking
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->foreignId('class_session_id')
                ->nullable()
                ->after('course_section_id')
                ->constrained('class_sessions')
                ->onDelete('set null');

            $table->index('class_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropForeign(['class_session_id']);
            $table->dropColumn('class_session_id');
        });

        Schema::dropIfExists('class_sessions');
    }
};
