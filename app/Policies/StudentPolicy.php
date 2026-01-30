<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can attempt to view the list.
        // The controller query will scope the results appropriately based on role.
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // An admin/staff can view any student, or a student can view their own record.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Only admin can create students for now.
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Admin can update any student, or a student can update their own profile.
        return in_array('admin', $userRoles) || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Only admin can delete students for now.
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();

        return in_array('admin', $userRoles);
    }
}
