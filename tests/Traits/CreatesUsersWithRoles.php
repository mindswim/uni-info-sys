<?php

namespace Tests\Traits;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;

trait CreatesUsersWithRoles
{
    protected function seedPermissions(): void
    {

        $permissions = [
            'view_students', 'create_students', 'update_students', 'delete_students',
            'view_academic_records', 'update_grades',
            'view_enrollments', 'create_enrollments', 'update_enrollments', 'delete_enrollments',
            'view_staff', 'create_staff', 'update_staff', 'delete_staff',
            'view_sections', 'create_sections', 'update_sections', 'delete_sections',
            'view_applications', 'create_applications', 'update_applications',
            'approve_applications', 'reject_applications',
            'manage_roles', 'manage_permissions',
            'view_courses', 'create_courses', 'update_courses', 'delete_courses',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name]);
        }

        // Admin gets all permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $adminRole->permissions()->syncWithoutDetaching(Permission::all()->pluck('id'));

        // Staff gets operational permissions
        $staffRole = Role::firstOrCreate(['name' => 'staff'], ['description' => 'Staff Member']);
        $staffRole->permissions()->syncWithoutDetaching(
            Permission::whereIn('name', [
                'view_students', 'view_academic_records', 'update_grades',
                'view_enrollments', 'create_enrollments', 'update_enrollments',
                'view_sections', 'update_sections',
                'view_courses',
                'view_applications', 'update_applications',
            ])->pluck('id')
        );

        // Student gets limited permissions
        $studentRole = Role::firstOrCreate(['name' => 'student'], ['description' => 'Student']);
        $studentRole->permissions()->syncWithoutDetaching(
            Permission::whereIn('name', [
                'view_academic_records', 'view_enrollments', 'create_enrollments',
                'view_courses', 'view_applications', 'create_applications', 'update_applications',
                'view_students',
            ])->pluck('id')
        );

    }

    protected function createAdminUser(): User
    {
        $this->seedPermissions();
        $user = User::factory()->create();
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $user->roles()->attach($adminRole);

        return $user;
    }

    protected function createStaffUser(): User
    {
        $this->seedPermissions();
        $user = User::factory()->create();
        Staff::factory()->create(['user_id' => $user->id]);
        $staffRole = Role::firstOrCreate(['name' => 'staff'], ['description' => 'Staff Member']);
        $user->roles()->attach($staffRole);

        return $user;
    }

    protected function createStudentUser(): User
    {
        $this->seedPermissions();
        $user = User::factory()->create();
        Student::factory()->create(['user_id' => $user->id]);
        $studentRole = Role::firstOrCreate(['name' => 'student'], ['description' => 'Student']);
        $user->roles()->attach($studentRole);

        return $user;
    }

    protected function createStudentWithApplication(): Student
    {
        $user = $this->createStudentUser();

        return $user->student;
    }
}
