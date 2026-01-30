<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollment_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('advisor_id')->constrained('staff')->onDelete('cascade');
            $table->foreignId('course_section_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->text('notes')->nullable();
            $table->dateTime('requested_at');
            $table->dateTime('responded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollment_approvals');
    }
};
