<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin/staff can view all enrollments, students can view their own
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Enrollment $enrollment): bool
    {
        // Admin/staff can view any enrollment, student can view their own
        return $user->hasRole('admin') ||
               $user->hasRole('staff') ||
               ($user->hasRole('student') && $user->id === $enrollment->student->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, staff, and students can create enrollments
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Enrollment $enrollment): bool
    {
        // Admin/staff can update any enrollment, student can update their own
        return $user->hasRole('admin') ||
               $user->hasRole('staff') ||
               ($user->hasRole('student') && $user->id === $enrollment->student->user_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Enrollment $enrollment): bool
    {
        // Admin/staff can delete any, student can withdraw from their own enrollment
        return $user->hasRole('admin') ||
               $user->hasRole('staff') ||
               ($user->hasRole('student') && $user->id === $enrollment->student->user_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Enrollment $enrollment): bool
    {
        // Only admin can restore
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Enrollment $enrollment): bool
    {
        // Only admin can force delete
        return $user->hasRole('admin');
    }
}
