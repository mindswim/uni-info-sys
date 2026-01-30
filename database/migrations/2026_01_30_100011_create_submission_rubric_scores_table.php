<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_rubric_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rubric_criteria_id')->constrained('rubric_criteria')->cascadeOnDelete();
            $table->foreignId('rubric_level_id')->nullable()->constrained('rubric_levels')->nullOnDelete();
            $table->decimal('points_awarded', 8, 2);
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->unique(['assignment_submission_id', 'rubric_criteria_id'], 'submission_criteria_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_rubric_scores');
    }
};
