<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_forms_1098t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('tax_year');
            $table->decimal('qualified_tuition', 10, 2)->default(0);
            $table->decimal('scholarships_grants', 10, 2)->default(0);
            $table->decimal('adjustments', 10, 2)->default(0);
            $table->enum('billing_method', ['payments_received', 'amounts_billed'])->default('amounts_billed');
            $table->string('institution_ein', 20);
            $table->string('institution_name');
            $table->string('institution_address');
            $table->string('student_ssn_last4', 255); // encrypted at app level
            $table->datetime('generated_at')->nullable();
            $table->enum('status', ['draft', 'final', 'corrected'])->default('draft');
            $table->timestamps();

            $table->unique(['student_id', 'tax_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_forms_1098t');
    }
};
