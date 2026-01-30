<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('early_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raised_by')->constrained('staff')->cascadeOnDelete();
            $table->enum('alert_type', ['poor_attendance', 'failing_grade', 'missing_assignments', 'behavioral', 'other']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('description');
            $table->enum('status', ['open', 'acknowledged', 'in_progress', 'resolved', 'dismissed'])->default('open');
            $table->foreignId('resolved_by')->nullable()->constrained('staff')->nullOnDelete();
            $table->datetime('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['raised_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('early_alerts');
    }
};
