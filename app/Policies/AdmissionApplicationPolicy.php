<?php

namespace App\Policies;

use App\Models\AdmissionApplication;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AdmissionApplicationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin/staff can view all applications, students can view their own
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Admin/staff can view any application, student can view their own
        return $user->hasRole('admin') || 
               $user->hasRole('staff') || 
               ($user->hasRole('student') && $user->id === $admissionApplication->student->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, staff, and students can create applications
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Admin/staff can update any application, student can update their own draft applications
        if ($user->hasRole('admin') || $user->hasRole('staff')) {
            return true;
        }
        
        // Student can only update their own draft applications
        return $user->hasRole('student') && 
               $user->id === $admissionApplication->student->user_id && 
               $admissionApplication->status === 'draft';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Admin can delete any, student can delete their own draft applications
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Student can only delete their own draft applications
        return $user->hasRole('student') && 
               $user->id === $admissionApplication->student->user_id && 
               $admissionApplication->status === 'draft';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Only admin can restore
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Only admin can force delete
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can approve applications.
     */
    public function approve(User $user): bool
    {
        // Only admin and staff with approval permissions can approve
        return $user->hasRole('admin') || ($user->hasRole('staff') && $user->hasPermission('approve-applications'));
    }
}
