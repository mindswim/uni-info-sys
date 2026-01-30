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
        Schema::table('programs', function (Blueprint $table) {
            // Add CIP (Classification of Instructional Programs) code for federal reporting
            $table->string('cip_code', 7)->nullable()->after('degree_level')
                ->comment('6-digit CIP code for federal reporting (e.g., 11.0701 for Computer Science)');

            // Add credit hour requirements for graduation
            $table->integer('total_credit_hours')->default(120)->after('duration')
                ->comment('Total credit hours required for degree completion');

            // Add index for CIP code lookups
            $table->index('cip_code');
        });

        Schema::table('courses', function (Blueprint $table) {
            // Add course level classification based on numbering
            $table->enum('level', ['lower_division', 'upper_division', 'graduate', 'advanced_graduate'])
                ->after('credits')->default('lower_division')
                ->comment('Course level: lower (1-99), upper (100-199), graduate (200-299), advanced (300+)');

            // Add prerequisite tracking
            $table->json('prerequisites')->nullable()->after('level')
                ->comment('JSON array of course IDs that must be completed before enrollment');

            // Add course numbering validation and indexing
            $table->string('course_number', 10)->nullable()->after('course_code')
                ->comment('Extracted numeric portion of course code for sorting');

            $table->index(['department_id', 'course_number']);
            $table->index('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex(['cip_code']);
            $table->dropColumn(['cip_code', 'total_credit_hours']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['department_id', 'course_number']);
            $table->dropIndex(['level']);
            $table->dropColumn(['level', 'prerequisites', 'course_number']);
        });
    }
};
