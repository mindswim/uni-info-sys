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
        // Financial aid package - the overall award for a student for a term
        Schema::create('financial_aid_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'offered', 'accepted', 'declined', 'cancelled'])->default('pending');

            // Cost of Attendance breakdown
            $table->decimal('tuition_cost', 10, 2)->default(0);
            $table->decimal('fees_cost', 10, 2)->default(0);
            $table->decimal('room_board_cost', 10, 2)->default(0);
            $table->decimal('books_supplies_cost', 10, 2)->default(0);
            $table->decimal('transportation_cost', 10, 2)->default(0);
            $table->decimal('personal_cost', 10, 2)->default(0);

            // Financial need calculation
            $table->decimal('expected_family_contribution', 10, 2)->nullable(); // EFC from FAFSA
            $table->decimal('demonstrated_need', 10, 2)->nullable(); // COA - EFC

            // Aid totals (calculated from aid_awards)
            $table->decimal('total_grants', 10, 2)->default(0); // free money
            $table->decimal('total_scholarships', 10, 2)->default(0);
            $table->decimal('total_loans', 10, 2)->default(0);
            $table->decimal('total_work_study', 10, 2)->default(0);

            $table->decimal('unmet_need', 10, 2)->default(0); // remaining after all aid

            $table->date('offer_date')->nullable();
            $table->date('response_deadline')->nullable();
            $table->date('accepted_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'term_id']);
            $table->index(['status', 'term_id']);
        });

        // Individual aid awards within a package
        Schema::create('aid_awards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_aid_package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scholarship_id')->nullable()->constrained()->nullOnDelete();

            $table->enum('aid_type', [
                'scholarship',      // Institutional merit/need scholarships
                'grant',           // Federal/state grants (Pell, SEOG, state)
                'loan_subsidized', // Federal Direct Subsidized
                'loan_unsubsidized', // Federal Direct Unsubsidized
                'loan_plus',       // Parent PLUS loans
                'loan_private',    // Private loans
                'work_study',      // Federal Work-Study
                'external',        // External scholarships
                'tuition_waiver',  // Staff/faculty tuition waivers
                'other'
            ]);

            $table->string('name'); // e.g., "Presidential Scholarship", "Federal Pell Grant"
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('disbursement_schedule', ['one_time', 'per_semester', 'monthly'])->default('per_semester');
            $table->enum('status', ['offered', 'accepted', 'declined', 'disbursed', 'cancelled'])->default('offered');

            // For loans
            $table->decimal('interest_rate', 5, 3)->nullable();
            $table->decimal('origination_fee', 5, 3)->nullable();

            // Conditions
            $table->decimal('min_gpa_to_maintain', 3, 2)->nullable();
            $table->integer('min_credits_to_maintain')->nullable();
            $table->text('conditions')->nullable();

            $table->timestamps();

            $table->index(['aid_type', 'status']);
        });

        // Track disbursements
        Schema::create('aid_disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aid_award_id')->constrained()->cascadeOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('scheduled_date');
            $table->date('disbursed_date')->nullable();
            $table->enum('status', ['scheduled', 'pending', 'disbursed', 'held', 'cancelled'])->default('scheduled');
            $table->string('hold_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'scheduled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aid_disbursements');
        Schema::dropIfExists('aid_awards');
        Schema::dropIfExists('financial_aid_packages');
    }
};
