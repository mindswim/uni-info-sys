<?php

namespace App\Policies;

use App\Models\Staff;
use App\Models\User;

class StaffPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin/staff can view all staff, students cannot
        return $user->hasRole('admin') || $user->hasRole('staff');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Staff $staff): bool
    {
        // Admin can view any staff, staff can view their own profile
        return $user->hasRole('admin') ||
               ($user->hasRole('staff') && $user->id === $staff->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create staff records
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Staff $staff): bool
    {
        // Admin can update any staff, staff can update their own profile
        return $user->hasRole('admin') ||
               ($user->hasRole('staff') && $user->id === $staff->user_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Staff $staff): bool
    {
        // Only admin can delete staff records
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Staff $staff): bool
    {
        // Only admin can restore
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Staff $staff): bool
    {
        // Only admin can force delete
        return $user->hasRole('admin');
    }
}
