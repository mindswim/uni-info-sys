<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class RolePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin and staff can view roles
        return in_array('admin', $userRoles) || in_array('staff', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Role $role): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin and staff can view specific roles
        return in_array('admin', $userRoles) || in_array('staff', $userRoles);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can create roles
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Role $role): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can update roles
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Role $role): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can delete roles
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Role $role): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can restore roles
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Role $role): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can force delete roles
        return in_array('admin', $userRoles);
    }
}
