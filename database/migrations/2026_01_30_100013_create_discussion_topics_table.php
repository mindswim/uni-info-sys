<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_section_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_anonymous')->default(false);
            $table->unsignedInteger('reply_count')->default(0);
            $table->datetime('last_reply_at')->nullable();
            $table->timestamps();

            $table->index(['course_section_id', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_topics');
    }
};
