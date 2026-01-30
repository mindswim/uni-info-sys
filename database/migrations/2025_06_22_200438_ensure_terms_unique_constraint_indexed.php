<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the unique constraint already exists
        $hasUniqueConstraint = $this->hasUniqueConstraint();

        if (! $hasUniqueConstraint) {
            Schema::table('terms', function (Blueprint $table) {
                $table->unique(['academic_year', 'semester'], 'terms_academic_year_semester_unique');
            });
        }

        // Add individual indexes for better query performance
        if (! $this->hasIndex('terms_academic_year_index')) {
            Schema::table('terms', function (Blueprint $table) {
                $table->index('academic_year', 'terms_academic_year_index');
            });
        }

        if (! $this->hasIndex('terms_semester_index')) {
            Schema::table('terms', function (Blueprint $table) {
                $table->index('semester', 'terms_semester_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('terms', function (Blueprint $table) {
            // Drop indexes if they exist
            if ($this->hasIndex('terms_academic_year_index')) {
                $table->dropIndex('terms_academic_year_index');
            }

            if ($this->hasIndex('terms_semester_index')) {
                $table->dropIndex('terms_semester_index');
            }

            // Drop unique constraint if it exists
            if ($this->hasUniqueConstraint()) {
                $table->dropUnique('terms_academic_year_semester_unique');
            }
        });
    }

    /**
     * Check if the unique constraint exists
     */
    private function hasUniqueConstraint(): bool
    {
        $databaseName = DB::getDatabaseName();

        // Check for MySQL
        if (DB::getDriverName() === 'mysql') {
            $constraint = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'terms' 
                AND CONSTRAINT_TYPE = 'UNIQUE'
                AND CONSTRAINT_NAME = 'terms_academic_year_semester_unique'
            ", [$databaseName]);

            return ! empty($constraint);
        }

        // For other databases, assume constraint exists to be safe
        return false;
    }

    /**
     * Check if an index exists
     */
    private function hasIndex(string $indexName): bool
    {
        $databaseName = DB::getDatabaseName();

        // Check for MySQL
        if (DB::getDriverName() === 'mysql') {
            $index = DB::select("
                SELECT INDEX_NAME 
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'terms' 
                AND INDEX_NAME = ?
            ", [$databaseName, $indexName]);

            return ! empty($index);
        }

        // For other databases, assume index doesn't exist
        return false;
    }
};
