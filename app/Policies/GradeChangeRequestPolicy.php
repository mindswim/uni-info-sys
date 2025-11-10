<?php

namespace App\Policies;

use App\Models\GradeChangeRequest;
use App\Models\User;

class GradeChangeRequestPolicy
{
    /**
     * Determine if the user can view the grade change request
     */
    public function view(User $user, GradeChangeRequest $gradeChangeRequest): bool
    {
        // Admins can view all
        if ($user->hasRole('admin')) {
            return true;
        }

        // Instructor of the course can view
        $courseSection = $gradeChangeRequest->enrollment->courseSection;
        if ($user->hasRole('faculty') && $courseSection->instructor_id === $user->staff?->id) {
            return true;
        }

        // Requester can view their own request
        if ($gradeChangeRequest->requested_by === $user->id) {
            return true;
        }

        // Department chair can view requests for their department's courses
        if ($user->hasRole('department_chair')) {
            $department = $courseSection->course->department;
            return $user->staff && $user->staff->department_id === $department->id;
        }

        return false;
    }

    /**
     * Determine if the user can approve/deny the grade change request
     */
    public function approve(User $user, GradeChangeRequest $gradeChangeRequest): bool
    {
        // Only admins and department chairs can approve
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('department_chair')) {
            $courseSection = $gradeChangeRequest->enrollment->courseSection;
            $department = $courseSection->course->department;
            return $user->staff && $user->staff->department_id === $department->id;
        }

        return false;
    }

    /**
     * Determine if the user can create a grade change request
     */
    public function create(User $user): bool
    {
        // Faculty and admins can request grade changes
        return $user->hasRole('faculty') || $user->hasRole('admin');
    }
}
