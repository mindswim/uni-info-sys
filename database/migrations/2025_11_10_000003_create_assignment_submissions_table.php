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
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->dateTime('submitted_at')->nullable();
            $table->text('content')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->enum('status', [
                'not_started',
                'in_progress',
                'submitted',
                'late',
                'graded',
                'returned'
            ])->default('not_started');
            $table->decimal('score', 8, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->dateTime('graded_at')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('staff')->onDelete('set null');
            $table->integer('late_days')->default(0);
            $table->decimal('late_penalty_applied', 8, 2)->default(0);
            $table->decimal('final_score', 8, 2)->nullable();
            $table->integer('attempt_number')->default(1);
            $table->timestamps();

            // Indexes
            $table->index(['assignment_id', 'status']);
            $table->index(['enrollment_id', 'assignment_id']);
            $table->unique(['assignment_id', 'enrollment_id', 'attempt_number'], 'unique_submission_attempt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};
