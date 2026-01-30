<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('graduation_applications', function (Blueprint $table) {
            $table->json('clearance_status')->nullable()->after('status');
            $table->json('degree_audit_snapshot')->nullable()->after('clearance_status');
        });

        // Expand status enum to include clearance_in_progress and cleared
        DB::statement("ALTER TABLE graduation_applications MODIFY COLUMN status ENUM('pending', 'under_review', 'clearance_in_progress', 'cleared', 'approved', 'denied') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE graduation_applications MODIFY COLUMN status ENUM('pending', 'under_review', 'approved', 'denied') DEFAULT 'pending'");

        Schema::table('graduation_applications', function (Blueprint $table) {
            $table->dropColumn(['clearance_status', 'degree_audit_snapshot']);
        });
    }
};
