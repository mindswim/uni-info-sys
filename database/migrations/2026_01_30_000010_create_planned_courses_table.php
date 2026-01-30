<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planned_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['planned', 'enrolled', 'completed', 'dropped'])->default('planned');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planned_courses');
    }
};
