<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_response_id')->constrained()->onDelete('cascade');
            $table->foreignId('evaluation_question_id')->constrained()->onDelete('cascade');
            $table->integer('rating_value')->nullable();
            $table->text('text_value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_answers');
    }
};
