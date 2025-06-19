<?php

namespace App\Policies;

use App\Models\ProgramChoice;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProgramChoicePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin/staff can view all program choices, students can view their own
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || in_array('student', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProgramChoice $programChoice): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin/staff can view any program choice, student can view their own
        return in_array('admin', $userRoles) || 
               in_array('staff', $userRoles) || 
               (in_array('student', $userRoles) && $user->id === $programChoice->admissionApplication->student->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin, staff, and students can create program choices
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || in_array('student', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProgramChoice $programChoice): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin/staff can update any program choice, student can update their own if application is draft
        if (in_array('admin', $userRoles) || in_array('staff', $userRoles)) {
            return true;
        }
        
        // Student can only update their own program choices if the application is still a draft
        return in_array('student', $userRoles) && 
               $user->id === $programChoice->admissionApplication->student->user_id &&
               $programChoice->admissionApplication->status === 'draft';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProgramChoice $programChoice): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin can delete any, student can delete their own if application is draft
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Student can only delete their own program choices if the application is still a draft
        return in_array('student', $userRoles) && 
               $user->id === $programChoice->admissionApplication->student->user_id &&
               $programChoice->admissionApplication->status === 'draft';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ProgramChoice $programChoice): bool
    {
        // Only admin can restore
        return in_array('admin', $user->roles()->pluck('name')->toArray());
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ProgramChoice $programChoice): bool
    {
        // Only admin can force delete
        return in_array('admin', $user->roles()->pluck('name')->toArray());
    }
}
