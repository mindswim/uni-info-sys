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
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        // Admin/staff can view all applications, students can view their own
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || in_array('student', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AdmissionApplication $admissionApplication): bool
    {
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        // Admin/staff can view any application, student can view their own
        return in_array('admin', $userRoles) ||
               in_array('staff', $userRoles) ||
               (in_array('student', $userRoles) && $user->id === $admissionApplication->student->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        // Admin, staff, and students can create applications
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || in_array('student', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AdmissionApplication $admissionApplication): bool
    {
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        // Admin/staff can update any application, student can update their own draft applications
        if (in_array('admin', $userRoles) || in_array('staff', $userRoles)) {
            return true;
        }

        // Student can only update their own draft applications
        return in_array('student', $userRoles) &&
               $user->id === $admissionApplication->student->user_id &&
               $admissionApplication->status === 'draft';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AdmissionApplication $admissionApplication): bool
    {
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        // Admin can delete any, student can delete their own draft applications
        if (in_array('admin', $userRoles)) {
            return true;
        }

        // Student can only delete their own draft applications
        return in_array('student', $userRoles) &&
               $user->id === $admissionApplication->student->user_id &&
               $admissionApplication->status === 'draft';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Only admin can restore
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AdmissionApplication $admissionApplication): bool
    {
        // Only admin can force delete
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can approve applications.
     */
    public function approve(User $user): bool
    {
        $userRoles = array_map('strtolower', $user->roles()->pluck('name')->toArray());
        $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

        // Only admin and staff with approval permissions can approve
        return in_array('admin', $userRoles) || (in_array('staff', $userRoles) && in_array('approve-applications', $userPermissions));
    }
}
