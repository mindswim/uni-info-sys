<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('advisor_id')->constrained('staff')->cascadeOnDelete();
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(30);
            $table->enum('type', [
                'advising',
                'registration',
                'career',
                'academic',
                'personal',
                'other',
            ])->default('advising');
            $table->enum('status', [
                'scheduled',
                'confirmed',
                'completed',
                'cancelled',
                'no_show',
            ])->default('scheduled');
            $table->string('location')->nullable();
            $table->string('meeting_link')->nullable();
            $table->text('student_notes')->nullable();
            $table->text('advisor_notes')->nullable();
            $table->text('meeting_notes')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['advisor_id', 'scheduled_at']);
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
