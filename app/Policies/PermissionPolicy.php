<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PermissionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin and staff can view permissions
        return in_array('admin', $userRoles) || in_array('staff', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin and staff can view specific permissions
        return in_array('admin', $userRoles) || in_array('staff', $userRoles);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can create permissions
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can update permissions
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can delete permissions
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can restore permissions
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can force delete permissions
        return in_array('admin', $userRoles);
    }
}
