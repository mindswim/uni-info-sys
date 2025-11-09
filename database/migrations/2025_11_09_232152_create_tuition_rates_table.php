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
        Schema::create('tuition_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->nullable()->constrained('programs')->onDelete('cascade');
            $table->foreignId('term_id')->nullable()->constrained('terms')->onDelete('cascade');
            $table->enum('student_type', ['domestic', 'international'])->default('domestic');
            $table->enum('enrollment_status', ['full_time', 'part_time'])->default('full_time');
            $table->decimal('tuition_per_credit', 10, 2);
            $table->decimal('base_fee', 10, 2)->default(0);
            $table->decimal('technology_fee', 10, 2)->default(0);
            $table->decimal('activity_fee', 10, 2)->default(0);
            $table->decimal('health_fee', 10, 2)->default(0);
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['program_id', 'term_id', 'student_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tuition_rates');
    }
};
