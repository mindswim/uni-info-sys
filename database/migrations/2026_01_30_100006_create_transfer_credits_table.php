<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfer_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('external_institution');
            $table->string('external_course_code');
            $table->string('external_course_name');
            $table->decimal('external_credits', 5, 2);
            $table->foreignId('equivalent_course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->decimal('credits_awarded', 5, 2)->nullable();
            $table->string('grade_awarded', 5)->nullable();
            $table->enum('status', ['pending', 'approved', 'denied', 'partial'])->default('pending');
            $table->foreignId('evaluated_by')->nullable()->constrained('staff')->nullOnDelete();
            $table->datetime('evaluated_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_credits');
    }
};
