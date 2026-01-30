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
        Schema::table('staff', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('office_location');
            $table->text('specialization')->nullable()->after('bio')
                ->comment('Academic specialization areas');
            $table->string('education')->nullable()->after('specialization')
                ->comment('Highest degree and institution');
            $table->string('office_hours')->nullable()->after('education')
                ->comment('Weekly office hours schedule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['phone', 'specialization', 'education', 'office_hours']);
        });
    }
};
