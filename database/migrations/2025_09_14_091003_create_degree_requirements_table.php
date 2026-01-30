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
        Schema::create('degree_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->string('category', 100)
                ->comment('general_education, major_core, major_electives, free_electives, capstone');
            $table->string('name')->comment('Human-readable requirement name');
            $table->text('description')->nullable();
            $table->integer('required_credit_hours')
                ->comment('Credit hours needed to satisfy this requirement');
            $table->integer('min_courses')->default(0)
                ->comment('Minimum number of courses required');
            $table->integer('max_courses')->nullable()
                ->comment('Maximum number of courses that count toward this requirement');
            $table->decimal('min_gpa', 3, 2)->nullable()
                ->comment('Minimum GPA required for courses in this category');
            $table->json('allowed_courses')->nullable()
                ->comment('JSON array of course IDs or patterns that satisfy this requirement');
            $table->json('excluded_courses')->nullable()
                ->comment('JSON array of course IDs that cannot count toward this requirement');
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['program_id', 'category']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('degree_requirements');
    }
};
