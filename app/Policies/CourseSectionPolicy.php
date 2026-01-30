<?php

namespace App\Policies;

use App\Models\CourseSection;
use App\Models\User;

class CourseSectionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Everyone can view course sections (they're public data)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CourseSection $courseSection): bool
    {
        // Everyone can view individual course sections
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin and staff can create course sections
        return $user->hasRole('admin') || $user->hasRole('staff');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CourseSection $courseSection): bool
    {
        // Admin and staff can update course sections
        return $user->hasRole('admin') || $user->hasRole('staff');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CourseSection $courseSection): bool
    {
        // Only admin can delete course sections
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CourseSection $courseSection): bool
    {
        // Only admin can restore
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CourseSection $courseSection): bool
    {
        // Only admin can force delete
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can upload grades for the course section.
     * Only the assigned instructor can upload grades.
     */
    public function uploadGrades(User $user, CourseSection $courseSection): bool
    {
        // Check if user has grades.upload permission
        if (! $user->hasPermission('grades.upload')) {
            return false;
        }

        // Check if user is the assigned instructor for this course section
        // The instructor_id in course_sections table should match a staff record linked to the user
        if ($user->staff && $courseSection->instructor_id === $user->staff->id) {
            return true;
        }

        // Admins can also upload grades as a fallback
        return $user->hasPermission('enrollments.manage');
    }
}
