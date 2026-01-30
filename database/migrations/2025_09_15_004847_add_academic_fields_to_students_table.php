<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add critical academic fields to make student data more realistic
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Academic Performance
            $table->decimal('gpa', 3, 2)->nullable()->after('emergency_contact_phone')
                ->comment('Current cumulative GPA (0.00-4.00)');
            $table->decimal('semester_gpa', 3, 2)->nullable()->after('gpa')
                ->comment('Current semester GPA');

            // Academic Standing
            $table->enum('class_standing', ['freshman', 'sophomore', 'junior', 'senior', 'graduate'])
                ->default('freshman')->after('semester_gpa')
                ->comment('Academic class level');
            $table->enum('enrollment_status', ['full_time', 'part_time', 'withdrawn', 'graduated', 'suspended'])
                ->default('full_time')->after('class_standing')
                ->comment('Current enrollment status');
            $table->enum('academic_status', ['good_standing', 'academic_warning', 'academic_probation', 'academic_suspension'])
                ->default('good_standing')->after('enrollment_status')
                ->comment('Academic standing status');

            // Program Information
            $table->foreignId('major_program_id')->nullable()->after('academic_status')
                ->constrained('programs')->onDelete('set null')
                ->comment('Primary major program');
            $table->foreignId('minor_program_id')->nullable()->after('major_program_id')
                ->constrained('programs')->onDelete('set null')
                ->comment('Minor program if applicable');

            // Academic Timeline
            $table->date('admission_date')->nullable()->after('minor_program_id')
                ->comment('Date first admitted to university');
            $table->date('expected_graduation_date')->nullable()->after('admission_date')
                ->comment('Expected graduation date');
            $table->integer('total_credits_earned')->default(0)->after('expected_graduation_date')
                ->comment('Total credits completed');
            $table->integer('credits_in_progress')->default(0)->after('total_credits_earned')
                ->comment('Credits currently enrolled in');

            // Financial Information (basic)
            $table->boolean('financial_hold')->default(false)->after('credits_in_progress')
                ->comment('Account has financial hold');
            $table->boolean('receives_financial_aid')->default(false)->after('financial_hold')
                ->comment('Currently receiving financial aid');

            // Academic History
            $table->string('high_school')->nullable()->after('receives_financial_aid')
                ->comment('High school attended');
            $table->year('high_school_graduation_year')->nullable()->after('high_school')
                ->comment('High school graduation year');
            $table->integer('sat_score')->nullable()->after('high_school_graduation_year')
                ->comment('SAT score if available');
            $table->integer('act_score')->nullable()->after('sat_score')
                ->comment('ACT score if available');

            // Contact Information Enhancement
            $table->string('preferred_name')->nullable()->after('act_score')
                ->comment('Preferred name/nickname');
            $table->string('pronouns')->nullable()->after('preferred_name')
                ->comment('Preferred pronouns');
            $table->string('parent_guardian_name')->nullable()->after('pronouns')
                ->comment('Parent or guardian name');
            $table->string('parent_guardian_phone')->nullable()->after('parent_guardian_name')
                ->comment('Parent or guardian phone');

            // Add indexes for performance
            $table->index(['class_standing', 'enrollment_status']);
            $table->index(['major_program_id']);
            $table->index(['gpa']);
            $table->index(['academic_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['major_program_id']);
            $table->dropForeign(['minor_program_id']);

            // Drop indexes
            $table->dropIndex(['class_standing', 'enrollment_status']);
            $table->dropIndex(['major_program_id']);
            $table->dropIndex(['gpa']);
            $table->dropIndex(['academic_status']);

            // Drop all the added columns
            $table->dropColumn([
                'gpa', 'semester_gpa', 'class_standing', 'enrollment_status', 'academic_status',
                'major_program_id', 'minor_program_id', 'admission_date', 'expected_graduation_date',
                'total_credits_earned', 'credits_in_progress', 'financial_hold', 'receives_financial_aid',
                'high_school', 'high_school_graduation_year', 'sat_score', 'act_score',
                'preferred_name', 'pronouns', 'parent_guardian_name', 'parent_guardian_phone',
            ]);
        });
    }
};
