<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('type'); // registration, financial, academic, administrative, immunization
            $table->string('reason');
            $table->text('description')->nullable();
            $table->string('severity')->default('warning'); // info, warning, critical
            $table->boolean('prevents_registration')->default(true);
            $table->boolean('prevents_transcript')->default(false);
            $table->boolean('prevents_graduation')->default(false);
            $table->foreignId('placed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('department')->nullable(); // which office placed it
            $table->timestamp('placed_at');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'resolved_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holds');
    }
};
