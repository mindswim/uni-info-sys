<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     * Only admin can list all users.
     */
    public function viewAny(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     * Admin can view any user, users can view themselves.
     */
    public function view(User $user, User $model): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        return in_array('admin', $userRoles) || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        return in_array('admin', $userRoles) || $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin can delete, and can't delete themselves
        return in_array('admin', $userRoles) && $user->id !== $model->id;
    }
}
