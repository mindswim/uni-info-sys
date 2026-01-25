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
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description');
            $table->enum('type', ['merit', 'need', 'athletic', 'departmental', 'external', 'endowed']);
            $table->decimal('amount', 10, 2);
            $table->enum('amount_type', ['fixed', 'percentage', 'full_tuition']);
            $table->boolean('renewable')->default(true);
            $table->integer('max_semesters')->nullable(); // null = unlimited
            $table->decimal('min_gpa_required', 3, 2)->nullable();
            $table->integer('min_sat_required')->nullable();
            $table->integer('min_act_required')->nullable();
            $table->decimal('max_family_income', 12, 2)->nullable(); // for need-based
            $table->integer('available_slots')->nullable(); // null = unlimited
            $table->integer('slots_awarded')->default(0);
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->date('application_deadline')->nullable();
            $table->text('eligibility_criteria')->nullable();
            $table->text('required_documents')->nullable();
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};
