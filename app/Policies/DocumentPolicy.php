<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Models\Student;
use Illuminate\Auth\Access\Response;

class DocumentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin/staff can view anyone's documents. A student can only view their own.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Document $document): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Admin/staff can view any document, student can view their own.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $document->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Student $student): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // A student can add a document to their own profile. Admin/staff can add to any.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Document $document): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // Only admin/staff can update for now (e.g., to verify)
        return in_array('admin', $userRoles) || in_array('staff', $userRoles);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Document $document): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        // A student can delete their own document, or an admin/staff can.
        return in_array('admin', $userRoles) || in_array('staff', $userRoles) || $user->id === $document->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Document $document): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Document $document): bool
    {
        $userRoles = $user->roles()->pluck('name')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can verify documents.
     */
    public function verify(User $user): bool
    {
        // Only admin and staff with verification permissions can verify
        return $user->hasRole('admin') || ($user->hasRole('staff') && $user->hasPermission('verify-documents'));
    }
}
