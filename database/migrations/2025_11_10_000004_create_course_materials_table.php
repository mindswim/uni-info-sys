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
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_section_id')->constrained('course_sections')->onDelete('cascade');
            $table->foreignId('class_session_id')->nullable()->constrained('class_sessions')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'syllabus',
                'reading',
                'lecture_notes',
                'video',
                'link',
                'file',
                'other'
            ])->default('file');
            $table->text('content')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->dateTime('available_from')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['course_section_id', 'is_published']);
            $table->index(['course_section_id', 'type']);
            $table->index('class_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_materials');
    }
};
