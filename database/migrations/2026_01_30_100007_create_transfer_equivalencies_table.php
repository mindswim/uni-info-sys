<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfer_equivalencies', function (Blueprint $table) {
            $table->id();
            $table->string('external_institution');
            $table->string('external_course_code');
            $table->foreignId('internal_course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('approved_by')->constrained('staff')->cascadeOnDelete();
            $table->datetime('approved_at');
            $table->timestamps();

            $table->unique(['external_institution', 'external_course_code'], 'transfer_equiv_institution_course_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_equivalencies');
    }
};
