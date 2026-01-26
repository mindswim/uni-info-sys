<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('action_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('type'); // registration, financial_aid, payment, document, advising, course_eval, etc.
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, in_progress, completed, dismissed
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->string('action_url')->nullable(); // where to go to complete this
            $table->string('action_label')->nullable(); // button text
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->boolean('is_system_generated')->default(true);
            $table->string('source')->nullable(); // which system/process created it
            $table->json('metadata')->nullable(); // extra data specific to type
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['student_id', 'due_date']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('action_items');
    }
};
