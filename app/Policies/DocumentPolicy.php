<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DocumentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin/staff can view all documents, students can view their own
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Document $document): bool
    {
        // Admin/staff can view any document, student can view their own
        return $user->hasRole('admin') || 
               $user->hasRole('staff') || 
               ($user->hasRole('student') && $user->id === $document->student->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, staff, and students can create documents
        return $user->hasRole('admin') || $user->hasRole('staff') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Document $document): bool
    {
        // Admin/staff can update any document, student can update their own unverified documents
        if ($user->hasRole('admin') || $user->hasRole('staff')) {
            return true;
        }
        
        // Student can only update their own unverified documents
        return $user->hasRole('student') && 
               $user->id === $document->student->user_id && 
               !$document->verified;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Document $document): bool
    {
        // Admin can delete any, student can delete their own unverified documents
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Student can only delete their own unverified documents
        return $user->hasRole('student') && 
               $user->id === $document->student->user_id && 
               !$document->verified;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Document $document): bool
    {
        // Only admin can restore
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Document $document): bool
    {
        // Only admin can force delete
        return $user->hasRole('admin');
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
