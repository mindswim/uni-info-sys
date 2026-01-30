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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_section_id')->constrained('course_sections')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'homework',
                'quiz',
                'exam',
                'midterm',
                'final',
                'project',
                'paper',
                'presentation',
                'lab',
                'participation',
                'other',
            ])->default('homework');
            $table->dateTime('due_date');
            $table->dateTime('available_from')->nullable();
            $table->decimal('max_points', 8, 2)->default(100.00);
            $table->decimal('weight', 5, 2)->nullable()->comment('Percentage of final grade');
            $table->decimal('passing_score', 8, 2)->nullable();
            $table->boolean('allows_late')->default(true);
            $table->decimal('late_penalty_per_day', 5, 2)->default(10.00)->comment('Percentage deducted per day');
            $table->integer('max_late_days')->nullable()->comment('Null = unlimited');
            $table->string('instructions_file')->nullable();
            $table->boolean('is_published')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['course_section_id', 'due_date']);
            $table->index(['course_section_id', 'type']);
            $table->index(['course_section_id', 'is_published']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
