<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\Student;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Student $student): bool
    {
        // Admin/staff can view anyone's documents. A student can only view their own.
        return $user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Document $document): bool
    {
        // Admin/staff can view any document, student can view their own.
        return $user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $document->student->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Student $student): bool
    {
        // A student can add a document to their own profile. Admin/staff can add to any.
        return $user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $student->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Document $document): bool
    {
        // Only admin/staff can update for now (e.g., to verify)
        return $user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Document $document): bool
    {
        // A student can delete their own document, or an admin/staff can.
        return $user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $document->student->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Document $document): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Document $document): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can verify documents.
     */
    public function verify(User $user): bool
    {
        // Only admin and staff with verification permissions can verify
        return $user->hasRole('Admin') || $user->hasRole('admin') || ($user->hasRole('staff') && $user->hasPermission('verify-documents'));
    }
}
