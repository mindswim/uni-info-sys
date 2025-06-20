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
        // Create permissions based on the Advanced Features Implementation Plan
        $permissions = [
            // Role & Permission Management
            ['name' => 'roles.manage', 'description' => 'Create, read, update, delete, and assign roles'],
            ['name' => 'permissions.view', 'description' => 'View available permissions in the system'],
            
            // User Management
            ['name' => 'users.manage', 'description' => 'Manage user accounts'],
            
            // Academic Hierarchy Management
            ['name' => 'hierarchy.manage', 'description' => 'Manage Faculties, Departments, and Programs'],
            
            // Course Management
            ['name' => 'courses.manage', 'description' => 'CRUD operations for courses and their prerequisites'],
            ['name' => 'course-sections.manage', 'description' => 'CRUD operations for course sections, including assigning instructors'],
            
            // Student Management
            ['name' => 'students.manage', 'description' => 'Access and manage student data'],
            
            // Enrollment Management
            ['name' => 'enrollments.manage', 'description' => 'Admin-level management of all student enrollments'],
            ['name' => 'enrollments.manage.own', 'description' => 'Student-level ability to enroll in or drop courses'],
            
            // Grade Management
            ['name' => 'grades.upload', 'description' => 'Ability to upload grades for an assigned course section (Faculty)'],
            
            // Application Management
            ['name' => 'applications.manage', 'description' => 'Manage admission applications'],
            
            // Document Management
            ['name' => 'documents.manage', 'description' => 'Admin-level access to all user documents'],
            ['name' => 'documents.manage.own', 'description' => 'Student-level access to their own documents'],
            
            // Legacy permissions (for backward compatibility)
            ['name' => 'manage-applications', 'description' => 'Can manage student applications'],
            ['name' => 'submit-documents', 'description' => 'Can submit documents'],
            ['name' => 'view-own-data', 'description' => 'Can view own data'],
            ['name' => 'view-reports', 'description' => 'Can view system reports'],
            ['name' => 'approve-applications', 'description' => 'Can approve applications'],
            ['name' => 'manage-programs', 'description' => 'Can manage academic programs'],
            ['name' => 'verify-documents', 'description' => 'Can verify submitted documents'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }

        // Create roles based on the Advanced Features Implementation Plan
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'Super Admin'],
            ['description' => 'Full system access, including the ability to manage other admins and system-level settings']
        );

        $adminRole = Role::firstOrCreate(
            ['name' => 'Admin'],
            ['description' => 'Manages core academic structure, courses, terms, staff, and student records']
        );

        $admissionsOfficerRole = Role::firstOrCreate(
            ['name' => 'Admissions Officer'],
            ['description' => 'Manages admission applications, reviews submitted documents, and updates application statuses']
        );

        $facultyRole = Role::firstOrCreate(
            ['name' => 'Faculty'],
            ['description' => 'Manages course sections they are assigned to, including uploading grades and viewing enrollments']
        );

        $studentRole = Role::firstOrCreate(
            ['name' => 'Student'],
            ['description' => 'Manages their own profile, applications, documents, and course enrollments']
        );

        // Legacy roles (for backward compatibility)
        $legacyAdminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrator with full system access (legacy)']
        );

        $legacyStaffRole = Role::firstOrCreate(
            ['name' => 'staff'],
            ['description' => 'Staff member with moderate access (legacy)']
        );

        $legacyStudentRole = Role::firstOrCreate(
            ['name' => 'student'],
            ['description' => 'Student with limited access to own data (legacy)']
        );

        $legacyModeratorRole = Role::firstOrCreate(
            ['name' => 'moderator'],
            ['description' => 'Moderator with application review access (legacy)']
        );

        // Assign permissions to new roles
        // Super Admin gets all permissions
        $allPermissions = Permission::all();
        $superAdminRole->permissions()->sync($allPermissions);

        // Admin permissions
        $adminPermissions = Permission::whereIn('name', [
            'roles.manage',
            'permissions.view',
            'users.manage',
            'hierarchy.manage',
            'courses.manage',
            'course-sections.manage',
            'students.manage',
            'enrollments.manage',
            'applications.manage',
            'documents.manage',
            // Legacy permissions
            'manage-applications',
            'view-reports',
            'manage-programs',
            'verify-documents',
        ])->get();
        $adminRole->permissions()->sync($adminPermissions);

        // Admissions Officer permissions
        $admissionsOfficerPermissions = Permission::whereIn('name', [
            'applications.manage',
            'documents.manage',
            'students.manage',
            // Legacy permissions
            'manage-applications',
            'approve-applications',
            'verify-documents',
            'view-reports',
        ])->get();
        $admissionsOfficerRole->permissions()->sync($admissionsOfficerPermissions);

        // Faculty permissions
        $facultyPermissions = Permission::whereIn('name', [
            'grades.upload',
            'enrollments.manage', // For their own course sections
            'course-sections.manage', // For their own sections
        ])->get();
        $facultyRole->permissions()->sync($facultyPermissions);

        // Student permissions
        $studentPermissions = Permission::whereIn('name', [
            'enrollments.manage.own',
            'documents.manage.own',
            // Legacy permissions
            'submit-documents',
            'view-own-data',
        ])->get();
        $studentRole->permissions()->sync($studentPermissions);

        // Assign permissions to legacy roles for backward compatibility
        $legacyAdminRole->permissions()->sync($allPermissions);

        $legacyStaffPermissions = Permission::whereIn('name', [
            'manage-applications',
            'view-reports',
            'verify-documents',
            'manage-programs',
            'hierarchy.manage',
            'courses.manage',
            'course-sections.manage',
            'students.manage',
        ])->get();
        $legacyStaffRole->permissions()->sync($legacyStaffPermissions);

        $legacyStudentPermissions = Permission::whereIn('name', [
            'submit-documents',
            'view-own-data',
            'enrollments.manage.own',
            'documents.manage.own',
        ])->get();
        $legacyStudentRole->permissions()->sync($legacyStudentPermissions);

        $legacyModeratorPermissions = Permission::whereIn('name', [
            'approve-applications',
            'view-reports',
            'verify-documents',
            'applications.manage',
        ])->get();
        $legacyModeratorRole->permissions()->sync($legacyModeratorPermissions);
    }
}
