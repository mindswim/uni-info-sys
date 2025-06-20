<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if column already exists
        if (!Schema::hasColumn('departments', 'code')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->string('code', 10)->nullable()->after('faculty_id');
            });
        }

        // Update existing departments with generated codes
        DB::table('departments')->get()->each(function ($department) {
            $code = strtoupper(substr($department->name, 0, 4));
            // Make sure code is unique
            $counter = 1;
            $originalCode = $code;
            while (DB::table('departments')->where('code', $code)->where('id', '!=', $department->id)->exists()) {
                $code = $originalCode . $counter;
                $counter++;
            }
            DB::table('departments')->where('id', $department->id)->update(['code' => $code]);
        });

        // Now add the unique constraint
        Schema::table('departments', function (Blueprint $table) {
            $table->string('code', 10)->nullable(false)->change();
            // Check if unique constraint already exists before adding it
            if (!$this->hasUniqueConstraint('departments', 'code')) {
                $table->unique('code');
            }
        });
    }

    /**
     * Check if a unique constraint exists on a table column
     */
    private function hasUniqueConstraint(string $table, string $column): bool
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM {$table}");
            foreach ($indexes as $index) {
                if ($index->Key_name === "{$table}_{$column}_unique" && $index->Column_name === $column && $index->Non_unique == 0) {
                    return true;
                }
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            if (Schema::hasColumn('departments', 'code')) {
                $table->dropUnique(['code']);
                $table->dropColumn('code');
            }
        });
    }
};
