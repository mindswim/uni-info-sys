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
        // Admin/staff can view all program choices, students can view their own
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProgramChoice $programChoice): bool
    {
        // Admin/staff can view any program choice, student can view their own
        return $user->hasRole('admin') || 
               $user->hasRole('staff') || 
               ($user->hasRole('student') && $user->id === $programChoice->application->student->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, staff, and students can create program choices
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProgramChoice $programChoice): bool
    {
        // Admin/staff can update any program choice, student can update their own if application is draft
        if ($user->hasRole('admin') || $user->hasRole('staff')) {
            return true;
        }
        
        // Student can only update their own program choices if the application is still a draft
        return $user->hasRole('student') && 
               $user->id === $programChoice->application->student->user_id &&
               $programChoice->application->status === 'draft';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProgramChoice $programChoice): bool
    {
        // Admin can delete any, student can delete their own if application is draft
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Student can only delete their own program choices if the application is still a draft
        return $user->hasRole('student') && 
               $user->id === $programChoice->application->student->user_id &&
               $programChoice->application->status === 'draft';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ProgramChoice $programChoice): bool
    {
        // Only admin can restore
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ProgramChoice $programChoice): bool
    {
        // Only admin can force delete
        return $user->hasRole('admin');
    }
}
