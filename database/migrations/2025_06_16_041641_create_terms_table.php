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
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Fall 2024"
            $table->unsignedSmallInteger('academic_year'); // e.g., 2024
            $table->string('semester'); // e.g., "Fall", "Spring", "Summer"
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
            $table->unique(['academic_year', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terms');
    }
};
