<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define granular permissions for the system
        $permissions = [
            // Student permissions
            ['name' => 'view_students', 'description' => 'View student records'],
            ['name' => 'create_students', 'description' => 'Create new student records'],
            ['name' => 'update_students', 'description' => 'Update student records'],
            ['name' => 'delete_students', 'description' => 'Delete student records'],

            // Academic records permissions
            ['name' => 'view_academic_records', 'description' => 'View academic records'],
            ['name' => 'update_grades', 'description' => 'Update student grades'],

            // Enrollment permissions
            ['name' => 'view_enrollments', 'description' => 'View enrollment records'],
            ['name' => 'create_enrollments', 'description' => 'Create enrollment records'],
            ['name' => 'update_enrollments', 'description' => 'Update enrollment records'],
            ['name' => 'delete_enrollments', 'description' => 'Delete enrollment records'],

            // Staff permissions
            ['name' => 'view_staff', 'description' => 'View staff records'],
            ['name' => 'create_staff', 'description' => 'Create new staff records'],
            ['name' => 'update_staff', 'description' => 'Update staff records'],
            ['name' => 'delete_staff', 'description' => 'Delete staff records'],

            // Course section permissions
            ['name' => 'view_sections', 'description' => 'View course sections'],
            ['name' => 'create_sections', 'description' => 'Create course sections'],
            ['name' => 'update_sections', 'description' => 'Update course sections'],
            ['name' => 'delete_sections', 'description' => 'Delete course sections'],

            // Admission application permissions
            ['name' => 'view_applications', 'description' => 'View admission applications'],
            ['name' => 'create_applications', 'description' => 'Create admission applications'],
            ['name' => 'update_applications', 'description' => 'Update admission applications'],
            ['name' => 'approve_applications', 'description' => 'Approve admission applications'],
            ['name' => 'reject_applications', 'description' => 'Reject admission applications'],

            // Role and permission management
            ['name' => 'manage_roles', 'description' => 'Manage roles and permissions'],
            ['name' => 'manage_permissions', 'description' => 'Manage system permissions'],

            // Course catalog permissions
            ['name' => 'view_courses', 'description' => 'View course catalog'],
            ['name' => 'create_courses', 'description' => 'Create new courses'],
            ['name' => 'update_courses', 'description' => 'Update courses'],
            ['name' => 'delete_courses', 'description' => 'Delete courses'],
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                ['description' => $permission['description']]
            );
        }

        // Assign permissions to roles
        $this->assignPermissionsToRoles();
    }

    /**
     * Assign permissions to roles based on typical university hierarchy
     */
    private function assignPermissionsToRoles(): void
    {
        // Student role permissions
        $studentRole = Role::where('name', 'student')->first();
        if ($studentRole) {
            $studentRole->permissions()->sync(
                Permission::whereIn('name', [
                    'view_academic_records',
                    'view_enrollments',
                    'create_enrollments',
                    'view_courses',
                    'view_applications',
                    'create_applications',
                ])->pluck('id')
            );
        }

        // Staff/Faculty role permissions
        $staffRole = Role::where('name', 'staff')->first();
        if ($staffRole) {
            $staffRole->permissions()->sync(
                Permission::whereIn('name', [
                    'view_students',
                    'view_academic_records',
                    'update_grades',
                    'view_enrollments',
                    'create_enrollments',
                    'update_enrollments',
                    'view_sections',
                    'update_sections',
                    'view_courses',
                    'view_applications',
                    'update_applications',
                ])->pluck('id')
            );
        }

        // Admin role permissions - full access
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->permissions()->sync(Permission::all()->pluck('id'));
        }
    }
}
