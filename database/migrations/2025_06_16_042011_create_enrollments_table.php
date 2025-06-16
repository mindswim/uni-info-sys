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
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_section_id')->constrained()->onDelete('cascade');
            $table->timestamp('enrollment_date')->useCurrent();
            $table->enum('status', ['enrolled', 'waitlisted', 'completed', 'withdrawn'])->default('enrolled');
            $table->string('grade')->nullable(); // e.g., "A", "B+", "P" for Pass/Fail
            $table->timestamps();
            $table->unique(['student_id', 'course_section_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
