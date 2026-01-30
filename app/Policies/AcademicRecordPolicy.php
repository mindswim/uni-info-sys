<?php

namespace App\Policies;

use App\Models\AcademicRecord;
use App\Models\Student;
use App\Models\User;

class AcademicRecordPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Admin/staff can view anyone's records. A student can only view their own.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AcademicRecord $academicRecord): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Admin/staff can view any record, student can view their own.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $academicRecord->student->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Only admin can create for now.
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AcademicRecord $academicRecord): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Only admin can update for now.
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AcademicRecord $academicRecord): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Only admin can delete for now.
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AcademicRecord $academicRecord): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AcademicRecord $academicRecord): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        return in_array('admin', $userRoles);
    }
}
