<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graduation_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'under_review', 'approved', 'denied'])->default('pending');
            $table->date('application_date');
            $table->date('ceremony_date')->nullable();
            $table->text('special_requests')->nullable();
            $table->text('reviewer_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'program_id', 'term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduation_applications');
    }
};
