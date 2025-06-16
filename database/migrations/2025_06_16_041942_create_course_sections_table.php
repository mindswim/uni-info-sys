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
        Schema::create('course_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('term_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('instructor_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->unsignedInteger('capacity');
            $table->enum('status', ['open', 'closed', 'cancelled'])->default('open');
            $table->string('schedule_days')->nullable(); // e.g., "MWF", "TTh"
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_sections');
    }
};
