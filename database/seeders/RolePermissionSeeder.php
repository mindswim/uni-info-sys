<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            ['name' => 'manage-applications', 'description' => 'Can manage student applications'],
            ['name' => 'submit-documents', 'description' => 'Can submit documents'],
            ['name' => 'view-own-data', 'description' => 'Can view own data'],
            ['name' => 'manage-users', 'description' => 'Can manage users'],
            ['name' => 'view-reports', 'description' => 'Can view system reports'],
            ['name' => 'approve-applications', 'description' => 'Can approve applications'],
            ['name' => 'manage-programs', 'description' => 'Can manage academic programs'],
            ['name' => 'verify-documents', 'description' => 'Can verify submitted documents'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrator with full system access']
        );

        $studentRole = Role::firstOrCreate(
            ['name' => 'student'],
            ['description' => 'Student with limited access to own data']
        );

        $staffRole = Role::firstOrCreate(
            ['name' => 'staff'],
            ['description' => 'Staff member with moderate access']
        );

        $moderatorRole = Role::firstOrCreate(
            ['name' => 'moderator'],
            ['description' => 'Moderator with application review access']
        );

        // Assign permissions to roles
        $adminPermissions = Permission::all();
        $adminRole->permissions()->sync($adminPermissions);

        $studentPermissions = Permission::whereIn('name', [
            'submit-documents',
            'view-own-data'
        ])->get();
        $studentRole->permissions()->sync($studentPermissions);

        $staffPermissions = Permission::whereIn('name', [
            'manage-applications',
            'view-reports',
            'verify-documents',
            'manage-programs'
        ])->get();
        $staffRole->permissions()->sync($staffPermissions);

        $moderatorPermissions = Permission::whereIn('name', [
            'approve-applications',
            'view-reports',
            'verify-documents'
        ])->get();
        $moderatorRole->permissions()->sync($moderatorPermissions);
    }
}
