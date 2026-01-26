<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Check if user has admin role (case-insensitive).
     */
    private function isAdmin(User $user): bool
    {
        $userRoles = $user->roles()->pluck('name')->map(fn($r) => strtolower($r))->toArray();
        return in_array('admin', $userRoles) || in_array('super admin', $userRoles);
    }

    /**
     * Determine whether the user can view any models.
     * Only admin can list all users.
     */
    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can view the model.
     * Admin can view any user, users can view themselves.
     */
    public function view(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admin can delete, and can't delete themselves
        return $this->isAdmin($user) && $user->id !== $model->id;
    }
}
