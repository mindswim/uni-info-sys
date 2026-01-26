<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Role name mappings: old name => new standardized name
     * This handles both case changes and format standardization
     */
    private array $roleMappings = [
        'Super Admin' => 'super-admin',
        'Admin' => 'admin',
        'Admissions Officer' => 'admissions-officer',
        'Faculty' => 'faculty',
        'Student' => 'student',
        // Lowercase versions are already correct, but include for completeness
        'staff' => 'staff',
        'student' => 'student',
        'admin' => 'admin',
        'moderator' => 'moderator',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, handle potential duplicates by merging role assignments
        // For each old name that maps to an existing lowercase name, merge the user assignments
        foreach ($this->roleMappings as $oldName => $newName) {
            if ($oldName === $newName) {
                continue; // Skip if already standardized
            }

            $oldRole = DB::table('roles')->where('name', $oldName)->first();
            $newRole = DB::table('roles')->where('name', $newName)->first();

            if ($oldRole && $newRole) {
                // Both exist - move user assignments from old to new, then delete old
                // First, get all user_ids assigned to the old role
                $userIds = DB::table('role_user')
                    ->where('role_id', $oldRole->id)
                    ->pluck('user_id');

                foreach ($userIds as $userId) {
                    // Only insert if this user doesn't already have the new role
                    $exists = DB::table('role_user')
                        ->where('role_id', $newRole->id)
                        ->where('user_id', $userId)
                        ->exists();

                    if (! $exists) {
                        DB::table('role_user')->insert([
                            'role_id' => $newRole->id,
                            'user_id' => $userId,
                        ]);
                    }
                }

                // Delete old role assignments and permissions
                DB::table('role_user')->where('role_id', $oldRole->id)->delete();
                DB::table('permission_role')->where('role_id', $oldRole->id)->delete();
                DB::table('roles')->where('id', $oldRole->id)->delete();
            } elseif ($oldRole && ! $newRole) {
                // Only old exists - rename it to the new standardized name
                DB::table('roles')
                    ->where('id', $oldRole->id)
                    ->update(['name' => $newName]);
            }
            // If only new exists or neither exists, no action needed
        }
    }

    /**
     * Reverse the migrations.
     * Note: This is a best-effort reversal - some data may be lost if roles were merged
     */
    public function down(): void
    {
        // Reverse mappings for rollback
        $reverseMappings = [
            'super-admin' => 'Super Admin',
            'admissions-officer' => 'Admissions Officer',
            'faculty' => 'Faculty',
            // Don't revert admin, student, staff, moderator as they were already lowercase
        ];

        foreach ($reverseMappings as $newName => $oldName) {
            DB::table('roles')
                ->where('name', $newName)
                ->update(['name' => $oldName]);
        }
    }
};
