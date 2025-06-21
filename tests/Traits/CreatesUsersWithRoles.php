<?php

namespace Tests\Traits;

use App\Models\User;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Role;

trait CreatesUsersWithRoles
{
    protected function createAdminUser(): User
    {
        $user = User::factory()->create();
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $user->roles()->attach($adminRole);
        return $user;
    }

    protected function createStaffUser(): User
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $staffRole = Role::firstOrCreate(['name' => 'staff'], ['description' => 'Staff Member']);
        $user->roles()->attach($staffRole);
        return $user;
    }

    protected function createStudentUser(): User
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
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